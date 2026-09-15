-- Adds a free-text location to appointments, and a vaccinations table for
-- tracking the NHS routine immunisation schedule against a baby.
--
-- vaccinations is sparse by design: a row only exists once something has
-- actually been recorded against a schedule_key (see
-- lib/content/vaccinations.ts for the fixed schedule itself, which — like
-- WEEK_GUIDE — lives in code, not the database). No row for a given
-- (baby_id, schedule_key) simply means "not yet given".

alter table appointments add column location text not null default '';

create table vaccinations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  baby_id uuid not null,
  schedule_key text not null,
  given_date date,
  notes text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (baby_id, family_id) references babies (id, family_id) on delete cascade,
  unique (baby_id, schedule_key)
);
create index vaccinations_family_baby_idx on vaccinations (family_id, baby_id);

create trigger vaccinations_set_updated_at before update on vaccinations
  for each row execute function set_updated_at();
create trigger vaccinations_protect_created_by before insert or update on vaccinations
  for each row execute function protect_created_by();

alter table vaccinations enable row level security;

create policy "family members full access" on vaccinations
  for all
  to authenticated
  using (family_id in (select private.get_my_family_ids()))
  with check (family_id in (select private.get_my_family_ids()));

grant select, insert, update, delete on vaccinations to authenticated;
