-- Groups + resource assignment (curated content).
-- Extends beyond the signed Phase 0+1 scope — see CLAUDE.md for the note.
-- Assignment is additive: assigned resources aren't hidden from anyone,
-- they're just surfaced/prioritized for the targeted user or group.

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (group_id, user_id)
);

create table public.resource_assignments (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint resource_assignments_target_check check (
    (user_id is not null and group_id is null) or
    (user_id is null and group_id is not null)
  ),
  unique (resource_id, user_id),
  unique (resource_id, group_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.resource_assignments enable row level security;

-- groups: any signed-in user can read; only admins manage.
create policy "groups_select_authenticated" on public.groups
  for select using (auth.uid() is not null);
create policy "groups_insert_admin" on public.groups
  for insert with check (public.is_admin());
create policy "groups_update_admin" on public.groups
  for update using (public.is_admin());
create policy "groups_delete_admin" on public.groups
  for delete using (public.is_admin());

-- group_members: users can see their own memberships; admins manage all.
create policy "group_members_select_own_or_admin" on public.group_members
  for select using (user_id = auth.uid() or public.is_admin());
create policy "group_members_insert_admin" on public.group_members
  for insert with check (public.is_admin());
create policy "group_members_delete_admin" on public.group_members
  for delete using (public.is_admin());

-- resource_assignments: users can see assignments targeted at them directly
-- or via a group they belong to; admins manage all.
create policy "resource_assignments_select_own_or_admin" on public.resource_assignments
  for select using (
    user_id = auth.uid()
    or group_id in (select group_id from public.group_members where user_id = auth.uid())
    or public.is_admin()
  );
create policy "resource_assignments_insert_admin" on public.resource_assignments
  for insert with check (public.is_admin());
create policy "resource_assignments_update_admin" on public.resource_assignments
  for update using (public.is_admin());
create policy "resource_assignments_delete_admin" on public.resource_assignments
  for delete using (public.is_admin());
