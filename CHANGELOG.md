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
- Connected the real Supabase project, ran both migrations, created the first admin account, and verified the full flow end-to-end (login, admin CRUD, publish/feature toggles, save, goal notes, account creation) against live data.
- Renamed `middleware.ts` to `src/proxy.ts` per Next.js 16's deprecation of the middleware file convention (ran the official codemod).

## 2026-08-31 (visual identity)

- Replaced the placeholder brand palette with real colors pixel-sampled from the client's brief (sauce packet art). Core red/white/navy confirmed; four sauces mapped to the four categories; Sriracha green held in reserve. See [VISUAL_IDENTITY.md](./VISUAL_IDENTITY.md).
- Updated `globals.css` tokens accordingly; no component code changed since colors were already abstracted behind CSS custom properties.

## 2026-08-31 (post-deploy fixes)

- Deployed to Vercel; fixed an Internal Server Error caused by missing env vars and the Node.js runtime defaulting below the version Supabase's client libraries require.
- Added a "Change password" flow (`/account`) — any signed-in user can set a new password from their own session, since admin-created accounts start on an admin-issued temporary one and there was no way to change it.
- Broadened the `file` resource type (renamed from `pdf`, migration `0003_broaden_file_type.sql`) to accept PDF, Word, PowerPoint, Excel, and image uploads — the original PDF-only restriction didn't match the real content types in the brief (templates, seminar slides, books).
