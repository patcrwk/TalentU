# CLAUDE.md

Context for working in this repo. Read this before making changes.

## What this is

TalentU: a staff development platform for a single Chick-fil-A location. Client: Caleb Lamproe (HR lead), delivered through CR-WK. This build is scoped to **Phase 0 + Phase 1 of the signed TalentU MVP Development Agreement (70 hours, $5,600)** — see "Scope boundary" below before adding anything.

## Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config via `@theme` in `src/app/globals.css` — there is no `tailwind.config.js`)
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Deploy:** Vercel
- **Markdown rendering:** `react-markdown` (no raw HTML support, by design — keeps user-authored `content` safe to render without a sanitizer)

## Folder structure

```
src/
  app/                    routes (App Router)
    login/                public — the only route middleware doesn't gate
    library/[category]/   category browse, search + type filter via searchParams
    resource/[id]/        detail view + save button
    my-growth/            saved resources + goal notes CRUD
    admin/                admin-only (layout.tsx double-checks role; middleware is the primary gate)
      resources/          list, new, [id] edit; actions.ts has the server actions
      categories/         edit fixed categories; actions.ts
      users/               create accounts, reassign roles; actions.ts
  components/             shared UI (cards, nav, forms)
    admin/                admin-only form/row components
  lib/
    supabase/
      client.ts           browser client (client components)
      server.ts           server client (server components/actions) + createServiceRoleClient()
      middleware.ts        session refresh + route protection, used by root middleware.ts
      auth.ts             getCurrentAppUser() / requireAdmin() helpers
      types.ts            hand-written DB types (no generated types — schema is small and stable)
    categoryColors.ts     slug -> Tailwind class for the 4 fixed category color blocks
supabase/
  migrations/0001_init.sql  full schema, RLS policies, seed categories, storage bucket
```

## Auth model

- No public signup. Admins create accounts from `/admin/users`, which uses the **service-role client** (`createServiceRoleClient()` in `src/lib/supabase/server.ts`) to call `auth.admin.createUser()` with a generated temporary password shown once on screen. This was chosen over Supabase's `inviteUserByEmail()` flow to avoid depending on the project's outbound email/SMTP setup for MVP — the admin relays the temp password to the new hire directly. Worth revisiting if that's too manual once real usage starts.
- `public.users` extends `auth.users` (1:1 by `id`) and carries `role` (`admin` | `team_member`) and `display_name`.
- Root `middleware.ts` (delegates to `lib/supabase/middleware.ts`) refreshes the session on every request and gates **every route except `/login`** — this is an internal staff tool, so signed-out visitors are redirected to `/login` everywhere, not just on `/admin`. It additionally checks `public.users.role` for `/admin/*` and bounces non-admins to `/`.
- Row-level security enforces the same rules at the database layer independent of middleware (see migration) — `public.is_admin()` is a `SECURITY DEFINER` function so admin-checking policies don't recurse into RLS on `users` itself.

## Brand system — confirmed

Palette in `src/app/globals.css` (`--color-brand-*`, `--color-category-*`) is sampled from the client's own brief, not a placeholder. See [VISUAL_IDENTITY.md](./VISUAL_IDENTITY.md) for the source, exact values, and rationale. The four category color blocks are mapped by category slug in `src/lib/categoryColors.ts` — not stored in the DB, since the categories themselves are fixed for MVP.

## Scope boundary — do not build these without a separate agreement

Every item below is a priced, planned future phase. Flag it instead of building it if a request drifts here:

- Leader profiles or any cross-user social features
- Multi-location / franchise data architecture
- AI-assisted recommendations, coaching, or semantic search
- Trainings, courses, or learning-management tracking
- Formal assessments, surveys, or 360-style feedback
- SSO or enterprise auth
- Public signup
- Category add/delete (the 4 categories are fixed — only name/description/sort_order are editable)
- Resource delete (admin can create, edit, publish/unpublish, feature/unfeature — that's the full CRUD surface called for in the acceptance criteria; hard delete wasn't requested)
- Structured goal tracking (due dates, progress %, formal assessments) — `goal_notes` is intentionally just free text

When scope is ambiguous, build the smaller version and note the larger one here rather than assuming it's wanted.

## Supabase setup gotcha

The migration is split into `0001_init.sql` (core schema/RLS) and `0002_storage.sql` (the `resource-files` bucket). On a brand new Supabase project, the Storage service provisions its schema lazily on first dashboard visit — running the bucket-creation SQL before that happens fails with `relation "storage.buckets" does not exist`, and opening Storage immediately after can transiently show "Missing tenant config for tenant ..." for a minute while it finishes provisioning. Open **Storage** in the dashboard once, wait for it to load, then run `0002_storage.sql`.

## Known deviations from the spec's literal schema

- `resources.file_alt_text` (nullable) was added beyond the spec's data model to satisfy the non-functional requirement "alt text fields on any image upload." Only used for `pdf`-type resources today.
- `video` resources use `external_url` (e.g. a YouTube/Vimeo link) rather than a Storage upload — no video hosting/transcoding was in scope, and linking out is the sane MVP choice for a small operator.

## Content entry

All client content (seminars, templates, surveys, books) goes in through `/admin/resources` after the app is deployed — nothing is hardcoded into the codebase.
