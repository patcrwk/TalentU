# Architecture

## Data model

See [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql) for the source of truth (types, constraints, RLS policies, seed data). Summary:

```
users (1:1 with auth.users)
  id            uuid PK, references auth.users(id)
  role          enum: admin | team_member
  display_name  text
  created_at    timestamptz

categories                          -- fixed 4 rows, seeded by the migration
  id, name, slug (unique), description, sort_order

resources
  id, category_id (FK -> categories)
  title, description, content        -- content is markdown, rendered via react-markdown
  resource_type                      -- enum: article | link | pdf | video
  external_url                       -- used by link + video
  file_url, file_alt_text            -- used by pdf (Supabase Storage, bucket "resource-files")
  is_featured, is_published
  created_by (FK -> users), created_at, updated_at

saved_resources
  id, user_id (FK -> users), resource_id (FK -> resources), saved_at
  unique (user_id, resource_id)

goal_notes
  id, user_id (FK -> users), note_text, created_at, updated_at
```

Row-level security is on for every table. Key rules:

- `resources`: any signed-in user sees rows where `is_published = true`; admins (via `public.is_admin()`) see and write everything.
- `saved_resources` / `goal_notes`: a user can only read/write their own rows (`user_id = auth.uid()`).
- `categories`: any signed-in user can read; only admins can update. No insert/delete policy exists — add/delete category is out of scope.
- `users`: a user can read their own row; admins can read/write all rows.
- Storage bucket `resource-files` is public-read (so resource links work without a signed URL) but only admins can write to it.

## Route map

| Route | Access | Purpose |
|---|---|---|
| `/` | Signed-in | Featured resources, links into the 4 categories |
| `/login` | Public | Only unauthenticated route |
| `/library` | Signed-in | Browse the 4 categories |
| `/library/[category]` | Signed-in | Resources in a category; `?q=` search, `?type=` filter |
| `/resource/[id]` | Signed-in | Resource detail + save/unsave |
| `/my-growth` | Signed-in | Saved resources + goal notes CRUD |
| `/admin` | Admin | Dashboard (counts) |
| `/admin/resources` | Admin | List, publish/feature toggles |
| `/admin/resources/new` | Admin | Create |
| `/admin/resources/[id]` | Admin | Edit |
| `/admin/categories` | Admin | Edit name/description/sort_order (no add/delete) |
| `/admin/users` | Admin | Create accounts, view/reassign roles |

## Auth flow

1. Admin creates an account from `/admin/users` → server action `createTeamMember` uses the **service-role Supabase client** to call `auth.admin.createUser()` with a generated temp password, then inserts the matching `public.users` profile row. The temp password is shown once in the UI for the admin to relay directly (no outbound email dependency for MVP).
2. User signs in at `/login` (email + password) via the browser Supabase client (`signInWithPassword`), which sets Supabase's auth cookies.
3. Root `middleware.ts` runs on every request: refreshes the session, redirects signed-out visitors to `/login` (every route except `/login` itself requires auth), and additionally checks `public.users.role` for `/admin/*`, bouncing non-admins to `/`.
4. Server components/actions read the user via `lib/supabase/server.ts`'s cookie-based client; `lib/supabase/auth.ts` exposes `getCurrentAppUser()` and `requireAdmin()` for convenience. RLS enforces the same boundaries independently at the DB layer.

## Mutations

Reads happen directly in server components via the Supabase server client. Writes go through Next.js **server actions** colocated with each admin section (`src/app/admin/*/actions.ts`), except two client-side cases where the acting user only ever touches their own rows and RLS is sufficient: `SaveButton` (save/unsave) and `GoalNotes` (add/edit/delete notes) call the browser Supabase client directly.
