# Newborn Companion — hosted version (Phase A)

The hosted rewrite described in the root repo's plan: Next.js + Supabase,
family-code sharing (parents, grandparents, anyone with the code — no
per-person accounts yet), multiple babies per family, appointments, growth
charts, the week-by-week guide, crying decoder, support directory, and
global search. The original single-file `index.html` at the repo root is
unaffected and still works standalone.

## What's built vs. what needs you

Everything in this directory has been written, typechecked, linted, and
production-built successfully. The schema and RPCs in
`supabase/migrations/0001_init.sql` have been **run against a real
Postgres instance** (with a stub of Supabase's `auth` schema) and verified:
family data isolation (read, direct-ID lookup, and write), the join-by-code
RPC, wrong-code handling, rate limiting, and family deletion all behave as
designed — see the migration file's comments for what each policy is for.

What hasn't been tested, because it requires infrastructure this
environment doesn't have: an actual Supabase **project** (auth, RLS as
enforced by real PostgREST, Edge Functions, hosting). You'll need to do the
following before this runs for real:

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a new project. Grab these
from **Project Settings → API**:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.example` to `.env.local` and fill both in.

### 2. Enable anonymous sign-ins

**Authentication → Sign In / Providers → Anonymous Sign-Ins** — this is off
by default on new projects and the family-code flow depends on it.

### 3. Run the migration

Via the Supabase CLI (`npx supabase login`, `npx supabase link --project-ref
<ref>`, then `npx supabase db push`), or paste
`supabase/migrations/0001_init.sql` directly into the SQL Editor in the
Supabase dashboard and run it once.

### 4. Install and run

```bash
npm install
npm run dev
```

Visit `/join`, create a family, save the code it shows you (it's shown
exactly once), and go from there.

### 5. Deploy

Vercel is the natural fit for a Next.js app — connect the repo, set the two
env vars above in the project settings, done. Point it at the `web/`
subdirectory as the project root if deploying from this monorepo-style
repo.

## Known gaps (by design, for this phase)

- **Guide content** only has full weeks 1–12 plus two representative later
  months seeded, to prove out the new source-attributed, month-keyed shape
  (with NHS Start4Life, The Lullaby Trust, and UNICEF UK Baby Friendly
  Initiative as sources). Filling in the rest of the first year is a
  follow-up content-authoring pass, not a code change.
- **Experience log** (feeding/tummy time/nappies/sleep qualitative logging)
  and the **insight engine** (pattern callouts cross-referenced against
  growth-spurt/teething timing) are Phase B and C — not built yet.
- **Import** of an old single-file app's JSON export only happens once, at
  family creation (`/join`). Re-importing into an existing family, or
  merging two exports, is explicitly out of scope for v1.
- No family-code recovery if every device signs out and the code is lost
  (by design — the code is hashed, never stored in recoverable form). Any
  device that stays signed in can still see the code from Settings-side
  RPCs if that's added later; today there's no "view code again" surface
  either — worth adding before this goes further, since a lost code today
  means genuinely stuck.
