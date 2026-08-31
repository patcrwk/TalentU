# TalentU

Staff development platform for a single Chick-fil-A location, built for Caleb Lamproe (HR lead) through CR-WK.

This is the MVP: Phase 0 + Phase 1 scope only. See [CLAUDE.md](./CLAUDE.md) for the scope boundary and what's deliberately not built yet.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Deployed on Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then run the migrations against it in order — either paste each into the Supabase SQL Editor, or with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

1. **[0001_init.sql](./supabase/migrations/0001_init.sql)** — schema, RLS policies, the four fixed categories.
2. Open **Storage** in the dashboard sidebar once first. On a brand new project the storage schema provisions lazily on first visit, and can briefly 404 with "Missing tenant config for tenant ..." right after — that's normal, just wait a minute and reload the Storage page until it loads cleanly.
3. **[0002_storage.sql](./supabase/migrations/0002_storage.sql)** — creates the public `resource-files` storage bucket and its access policies. Run this only after step 2 succeeds, or it'll fail with `relation "storage.buckets" does not exist`.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in values from **Project Settings > API** in Supabase:

| Variable | Where to find it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > anon public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API > service_role key | **No — server-only.** Used to create staff accounts. Never commit it or expose it to client code. |

Never commit `.env.local` — it's already in `.gitignore`.

### 4. Create the first admin account

There's no public signup. Create the first admin directly in Supabase:

1. Supabase Dashboard > Authentication > Users > Add user (set email + password, confirm the email).
2. Supabase Dashboard > Table Editor > `users` > insert a row with that same `id`, `role = admin`, and a `display_name`.

After that, the admin can create every other account from `/admin/users` in the app.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Allow the password-reset redirect URL

"Forgot password" (`/forgot-password` → emailed link → `/reset-password`) needs its redirect URL allowlisted or Supabase won't send a working link. In **Supabase Dashboard > Authentication > URL Configuration > Redirect URLs**, add:

- `http://localhost:3000/reset-password` (local dev)
- `https://<your-vercel-domain>/reset-password` (production — add this once you know the deployed domain, and again for any custom domain later)

### 7. Deploy to Vercel

Node.js 22+ is required (Supabase's client libraries declare it as a minimum). In Vercel, set **Project Settings > General > Node.js Version** to 22.x, then set the three environment variables above in **Project Settings > Environment Variables** and deploy.

## Project docs

- [CLAUDE.md](./CLAUDE.md) — context for working in this repo, brand system status, scope boundary
- [ARCHITECTURE.md](./ARCHITECTURE.md) — data model, route map, auth flow
- [VISUAL_IDENTITY.md](./VISUAL_IDENTITY.md) — brand palette source and rationale
- [CHANGELOG.md](./CHANGELOG.md) — dated build log
