-- Newborn Companion — Phase A schema
--
-- Access model: family-code auth-lite via Supabase anonymous auth.
-- Every family-scoped table is gated by private.get_my_family_ids(), which
-- reads membership from family_members. That's the ONLY seam that changes
-- when this later upgrades to real accounts (email/password or magic
-- link) — these tables and policies do not change shape.
--
-- Uniform access: every family_members row has equal rights (no role
-- tiers) — same model as Huckleberry. Anyone holding the family code has
-- full read/write access to everything in that family.

create extension if not exists pgcrypto;

-- Helper functions that RLS policies depend on, but that a client should
-- never be able to call directly as an RPC, live here instead of public.
-- Do NOT add `private` to Supabase's exposed-schemas setting (Project
-- Settings -> API) — that's what actually keeps PostgREST from routing
-- POST /rest/v1/rpc/<fn> to anything in here, on top of the grants below.
create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table families (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null,
  code_last4 text not null,
  created_at timestamptz not null default now()
);
comment on table families is
  'No direct SELECT/INSERT for anon/authenticated. All access via the create_family/join_family_by_code RPCs (SECURITY DEFINER).';

create table family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  auth_method text not null default 'anonymous_code',
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
comment on column family_members.auth_method is
  'Bookkeeping for a future real-accounts migration: distinguishes legacy anonymous-code members from members who joined via real login. Not used by any RLS policy today.';

-- Rate limiting for join_family_by_code. requester_key is the first hop of
-- the caller's IP when available (so minting a fresh anonymous user
-- can''t reset the limit), falling back to their user id otherwise.
create table code_attempts (
  id bigint generated always as identity primary key,
  requester_key text not null,
  family_id uuid references families(id) on delete set null,
  attempted_at timestamptz not null default now()
);
create index code_attempts_requester_idx on code_attempts (requester_key, attempted_at);

create table babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null default '',
  dob date,
  birth_weight numeric,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  gestation_weeks numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Lets appointments/health_logs take a composite FK on (baby_id,
  -- family_id) so a baby can never be attached to the wrong family.
  unique (id, family_id)
);
create index babies_family_idx on babies (family_id);
comment on column babies.birth_weight is
  'Stored in whatever unit weight_unit says. Consumers (e.g. the weight chart''s reference line) MUST convert to kg when weight_unit = ''lb'' before comparing against health_logs values — see the lb-to-kg fix carried over from the original index.html.';

create table appointments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  baby_id uuid not null,
  type text not null default 'Other',
  date date not null,
  time time,
  title text not null default '',
  notes text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Composite FK: baby_id must belong to family_id, not just exist. Without
  -- this, RLS's family_id check alone would let a member of family A
  -- attach an appointment to a baby that actually belongs to family B.
  foreign key (baby_id, family_id) references babies (id, family_id) on delete cascade
);
create index appointments_family_baby_date_idx on appointments (family_id, baby_id, date);

create table health_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  baby_id uuid not null,
  type text not null check (type in ('weight', 'jaundice', 'temperature', 'other')),
  value text not null,
  value_numeric numeric,
  unit text not null default '',
  date date not null,
  notes text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (baby_id, family_id) references babies (id, family_id) on delete cascade
);
create index health_logs_family_baby_date_idx on health_logs (family_id, baby_id, date);
comment on column health_logs.value_numeric is
  'Numeric mirror of value, kept in sync by sync_health_log_numeric(). Null when value doesn''t parse as a number. Exists so charts/insight queries can filter/sort numerically without casting text at query time.';

-- ---------------------------------------------------------------------
-- Triggers: updated_at, value_numeric sync, created_by integrity
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger babies_set_updated_at before update on babies
  for each row execute function set_updated_at();
create trigger appointments_set_updated_at before update on appointments
  for each row execute function set_updated_at();
create trigger health_logs_set_updated_at before update on health_logs
  for each row execute function set_updated_at();

create or replace function sync_health_log_numeric()
returns trigger
language plpgsql
as $$
begin
  begin
    new.value_numeric := new.value::numeric;
  exception when others then
    new.value_numeric := null;
  end;
  return new;
end;
$$;

create trigger health_logs_sync_numeric before insert or update on health_logs
  for each row execute function sync_health_log_numeric();

-- created_by is not client-settable and not editable after the fact: on
-- INSERT it's forced to the caller's own uid regardless of what (if
-- anything) the client supplied; on UPDATE it's pinned to its original
-- value. A plain column DEFAULT only covers the "client omitted it" case
-- — a client that explicitly sends someone else's uid would otherwise get
-- away with it, and the old FOR ALL policy allowed rewriting it later.
create or replace function protect_created_by()
returns trigger
language plpgsql
security invoker
as $$
begin
  if TG_OP = 'INSERT' then
    new.created_by := (select auth.uid());
  elsif TG_OP = 'UPDATE' then
    new.created_by := old.created_by;
  end if;
  return new;
end;
$$;

create trigger appointments_protect_created_by before insert or update on appointments
  for each row execute function protect_created_by();
create trigger health_logs_protect_created_by before insert or update on health_logs
  for each row execute function protect_created_by();

-- ---------------------------------------------------------------------
-- The auth-lite -> real-accounts seam
-- ---------------------------------------------------------------------

create or replace function private.get_my_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_catalog, pg_temp
as $$
  select family_id from public.family_members where user_id = (select auth.uid());
$$;
comment on function private.get_my_family_ids is
  'The single seam every family-scoped RLS policy reads through. Upgrading to real accounts later only changes how rows get inserted into family_members — this function and every policy built on it stay exactly as-is. Lives in `private` (not REST-exposed) since a client has no legitimate reason to call this directly — only RLS policies use it, which needs EXECUTE granted but not schema exposure.';

revoke execute on function private.get_my_family_ids() from public;
grant execute on function private.get_my_family_ids() to authenticated;

-- Generates a high-entropy, human-typeable code (grouped 5-5-5-5, ~100
-- bits of entropy from 20 random bytes) — never a memorable phrase.
-- Excludes visually ambiguous characters (0/O, 1/I, L).
create or replace function private.generate_family_code()
returns text
language plpgsql
set search_path = public, pg_catalog, pg_temp
as $$
declare
  alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  raw bytea := gen_random_bytes(20);
  code text := '';
  i int;
begin
  for i in 0..19 loop
    code := code || substr(alphabet, (get_byte(raw, i) % length(alphabet)) + 1, 1);
  end loop;
  return substr(code, 1, 5) || '-' || substr(code, 6, 5) || '-' ||
         substr(code, 11, 5) || '-' || substr(code, 16, 5);
end;
$$;
comment on function private.generate_family_code is
  'Only ever called internally by create_family() (which runs SECURITY DEFINER as its owner) — never granted to authenticated, since a client has no legitimate reason to generate a code without also creating the family it belongs to.';

revoke execute on function private.generate_family_code() from public;

create or replace function create_family()
returns table(family_id uuid, code text)
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_family_id uuid;
  v_code text;
  v_normalized text;
begin
  if v_uid is null then
    raise exception 'Must be signed in';
  end if;

  v_code := private.generate_family_code();
  v_normalized := replace(v_code, '-', '');

  insert into public.families (code_hash, code_last4)
    values (crypt(v_normalized, gen_salt('bf', 12)), right(v_normalized, 4))
    returning id into v_family_id;

  insert into public.family_members (family_id, user_id, auth_method)
    values (v_family_id, v_uid, 'anonymous_code');

  return query select v_family_id, v_code;
end;
$$;
comment on function create_family is
  'Creates a family + membership for the caller and returns the plaintext code EXACTLY ONCE. Only code_hash is ever stored — the UI must force a "copy/save this" step since it cannot be shown again.';

revoke execute on function create_family() from public;
grant execute on function create_family() to authenticated;

create or replace function join_family_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_requester text;
  v_recent_failures int;
  v_normalized text;
  v_last4 text;
  v_match_family_id uuid;
  rec record;
begin
  if v_uid is null then
    raise exception 'Must be signed in';
  end if;

  -- Prefer the first hop of the caller's IP (x-forwarded-for can be a
  -- proxy chain "client, proxy1, proxy2" — only the first entry is the
  -- original client) so minting a fresh anonymous user can't reset the
  -- rate limit; fall back to their user id if headers aren't available
  -- (e.g. local psql testing outside PostgREST). This header is only
  -- trustworthy because it's set by the trusted infra in front of the
  -- request (Vercel/Supabase's own edge), not by the client directly.
  v_requester := coalesce(
    nullif(trim(split_part(
      current_setting('request.headers', true)::json ->> 'x-forwarded-for',
      ',', 1
    )), ''),
    v_uid::text
  );

  -- Serializes concurrent calls for the same requester within this
  -- transaction, so a burst of parallel guesses can't all read the same
  -- "9 attempts so far" count and all slip through before any of them
  -- commits its own attempt row. Released automatically at the end of
  -- this (PostgREST-managed, per-call) transaction.
  perform pg_advisory_xact_lock(hashtext(v_requester)::bigint);

  -- IMPORTANT: this function must return NULL rather than RAISE on an
  -- expected failure (bad code, rate limited). PostgREST runs each RPC
  -- call in its own transaction and rolls back everything the function
  -- did if it raises — including the code_attempts row meant to record
  -- the failed attempt, which would silently defeat the rate limiter.
  -- Returning NULL commits normally, so the attempt is actually recorded.
  -- The caller shows the same generic "code not recognised" message for
  -- both a wrong code and a rate-limit trip either way.

  select count(*) into v_recent_failures
    from public.code_attempts
    where requester_key = v_requester
      and attempted_at > now() - interval '15 minutes';

  if v_recent_failures >= 10 then
    insert into public.code_attempts (requester_key, family_id) values (v_requester, null);
    return null;
  end if;

  v_normalized := upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'));
  v_last4 := right(v_normalized, 4);

  for rec in select id, code_hash from public.families where code_last4 = v_last4 loop
    if crypt(v_normalized, rec.code_hash) = rec.code_hash then
      v_match_family_id := rec.id;
      exit;
    end if;
  end loop;

  -- Logged whether or not it matched, so repeated guesses against a
  -- specific family are visible even if requester_key rotates.
  insert into public.code_attempts (requester_key, family_id)
    values (v_requester, v_match_family_id);

  if v_match_family_id is null then
    return null;
  end if;

  insert into public.family_members (family_id, user_id, auth_method)
    values (v_match_family_id, v_uid, 'anonymous_code')
    on conflict (family_id, user_id) do nothing;

  return v_match_family_id;
end;
$$;
comment on function join_family_by_code is
  'Returns NULL (not an error) for both a wrong code and a rate-limit trip, so the caller shows one generic message and failed attempts can''t be used to enumerate whether a family exists. Only raises for a genuine error (not signed in). p_code = NULL falls through this same NULL-returning path by construction (regexp_replace/right on NULL propagate to NULL, so code_last4 matches nothing) — no separate early-exit check needed, and skipping the rate-limit bookkeeping for a NULL/malformed submission would actually be worse, not better.';

revoke execute on function join_family_by_code(text) from public;
grant execute on function join_family_by_code(text) to authenticated;

-- Erasing a family deletes it for EVERY linked member (parents, grandparents,
-- anyone holding the code) — cascades to babies/appointments/health_logs.
-- Membership check happens here since regular members have no direct DELETE
-- grant on `families` at all. The UI must use a stronger confirmation than a
-- single confirm() dialog before calling this, since it now affects more
-- than one device.
create or replace function delete_my_family(p_family_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
begin
  if not exists (
    select 1 from public.family_members
    where family_id = p_family_id and user_id = (select auth.uid())
  ) then
    raise exception 'Not a member of this family';
  end if;

  delete from public.families where id = p_family_id;
end;
$$;

revoke execute on function delete_my_family(uuid) from public;
grant execute on function delete_my_family(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table families enable row level security;
alter table family_members enable row level security;
alter table code_attempts enable row level security;
alter table babies enable row level security;
alter table appointments enable row level security;
alter table health_logs enable row level security;

-- families & code_attempts: intentionally NO policies for anon/authenticated.
-- RLS is enabled with zero permissive policies, which denies all direct
-- access; the only path in is through the SECURITY DEFINER RPCs above,
-- which bypass RLS as their own privilege. Deliberately no table-level
-- GRANT for these two either (see grants section below) — belt and braces.

create policy "members can see their family memberships" on family_members
  for select
  to authenticated
  using (family_id in (select private.get_my_family_ids()));

-- Uniform full access for every family-scoped table: any member of the
-- family can read/write/delete anything belonging to that family. No role
-- tiers by design.
create policy "family members full access" on babies
  for all
  to authenticated
  using (family_id in (select private.get_my_family_ids()))
  with check (family_id in (select private.get_my_family_ids()));

create policy "family members full access" on appointments
  for all
  to authenticated
  using (family_id in (select private.get_my_family_ids()))
  with check (family_id in (select private.get_my_family_ids()));

create policy "family members full access" on health_logs
  for all
  to authenticated
  using (family_id in (select private.get_my_family_ids()))
  with check (family_id in (select private.get_my_family_ids()));

-- ---------------------------------------------------------------------
-- Table grants
-- ---------------------------------------------------------------------
-- RLS policies decide WHICH rows are visible/writable; they don't by
-- themselves grant access to the table at all — Postgres still checks
-- ordinary table privileges first. Explicit here rather than assumed from
-- a project's default template, so this migration doesn't depend on
-- Supabase's default grants being what we think they are.
--
-- families and code_attempts get NO grant at all: every path to them goes
-- through the SECURITY DEFINER RPCs above, which run as their owner and
-- so don't need the calling role to have direct table privileges.

grant select on family_members to authenticated;
grant select, insert, update, delete on babies to authenticated;
grant select, insert, update, delete on appointments to authenticated;
grant select, insert, update, delete on health_logs to authenticated;
