# Changelog

## 2026-08-31

- Initial build: Next.js (App Router) + TypeScript + Tailwind v4 scaffold, Supabase client/server/middleware setup.
- Data model + RLS policies + storage bucket migration (`supabase/migrations/0001_init.sql`), seeded with the 4 fixed categories.
- Auth: admin-created accounts (no public signup), `/login`, route protection via middleware + RLS.
- Public-facing pages: `/` (featured + category links), `/library`, `/library/[category]` (search + type filter), `/resource/[id]` (detail + save).
- `/my-growth`: saved resources list, goal notes create/edit/delete.
- Admin CMS: `/admin` dashboard, `/admin/resources` (create/edit/publish/feature), `/admin/categories` (edit fixed categories), `/admin/users` (create accounts, reassign roles).
- Placeholder brand palette (red/navy/cream) applied site-wide, flagged in CLAUDE.md pending final client assets.
- `CLAUDE.md`, `ARCHITECTURE.md`, `README.md` written.
- Split the migration into `0001_init.sql` (schema/RLS) and `0002_storage.sql` (bucket) after hitting `storage.buckets does not exist` on a brand new Supabase project — Storage provisions lazily on first dashboard visit. Documented the workaround in README and CLAUDE.md.
