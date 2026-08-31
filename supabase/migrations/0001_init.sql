-- TalentU MVP schema
-- Phase 0 + Phase 1 scope only. See CLAUDE.md for the scope boundary.

create type user_role as enum ('admin', 'team_member');
create type resource_type as enum ('article', 'link', 'pdf', 'video');

-- Extends auth.users with app-specific profile fields.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'team_member',
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  content text,
  resource_type resource_type not null,
  external_url text,
  file_url text,
  file_alt_text text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

create table public.goal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  note_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixed MVP categories (see spec: no add/delete category UI).
insert into public.categories (name, slug, description, sort_order) values
  ('Financial', 'financial', 'Budgeting, saving, and financial wellness resources.', 1),
  ('Self Help', 'self-help', 'Personal growth and self-improvement resources.', 2),
  ('Relational', 'relational', 'Communication and relationship-building resources.', 3),
  ('Leadership Development', 'leadership-development', 'Leadership skills and development resources.', 4);

-- keep updated_at current on resources/goal_notes
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create trigger goal_notes_set_updated_at
  before update on public.goal_notes
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER helper avoids RLS recursion when policies check role.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.resources enable row level security;
alter table public.saved_resources enable row level security;
alter table public.goal_notes enable row level security;

-- users: everyone can read their own row; admins can read/manage all.
create policy "users_select_own_or_admin" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users_insert_admin" on public.users
  for insert with check (public.is_admin());
create policy "users_update_admin" on public.users
  for update using (public.is_admin());
create policy "users_delete_admin" on public.users
  for delete using (public.is_admin());

-- categories: any signed-in user can read; only admins can edit.
create policy "categories_select_authenticated" on public.categories
  for select using (auth.uid() is not null);
create policy "categories_update_admin" on public.categories
  for update using (public.is_admin());

-- resources: signed-in users see published rows; admins see and manage all.
create policy "resources_select_published_or_admin" on public.resources
  for select using (is_published or public.is_admin());
create policy "resources_insert_admin" on public.resources
  for insert with check (public.is_admin());
create policy "resources_update_admin" on public.resources
  for update using (public.is_admin());
create policy "resources_delete_admin" on public.resources
  for delete using (public.is_admin());

-- saved_resources: users manage only their own saves.
create policy "saved_resources_select_own" on public.saved_resources
  for select using (user_id = auth.uid());
create policy "saved_resources_insert_own" on public.saved_resources
  for insert with check (user_id = auth.uid());
create policy "saved_resources_delete_own" on public.saved_resources
  for delete using (user_id = auth.uid());

-- goal_notes: users manage only their own notes.
create policy "goal_notes_select_own" on public.goal_notes
  for select using (user_id = auth.uid());
create policy "goal_notes_insert_own" on public.goal_notes
  for insert with check (user_id = auth.uid());
create policy "goal_notes_update_own" on public.goal_notes
  for update using (user_id = auth.uid());
create policy "goal_notes_delete_own" on public.goal_notes
  for delete using (user_id = auth.uid());

-- Storage bucket setup lives in 0002_storage.sql — the storage schema is
-- provisioned lazily by Supabase (first visit to the Storage tab), so it can
-- 404 on a brand new project if run in the same script as the core schema.
