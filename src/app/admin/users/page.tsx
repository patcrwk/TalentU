import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserRow } from "@/components/admin/UserRow";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [{ data: users }, { data: groups }, { data: memberships }] = await Promise.all([
    supabase.from("users").select("*").order("created_at"),
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_members").select("user_id, group_id"),
  ]);

  const groupIdsByUser = new Map<string, string[]>();
  for (const m of memberships ?? []) {
    const existing = groupIdsByUser.get(m.user_id) ?? [];
    existing.push(m.group_id);
    groupIdsByUser.set(m.user_id, existing);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Team members</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/15 text-sm text-black/50">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium">Joined</th>
                <th className="pb-2 pr-4 font-medium">Groups</th>
                <th className="pb-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUser?.id}
                  allGroups={groups ?? []}
                  memberGroupIds={groupIdsByUser.get(user.id) ?? []}
                />
              ))}
            </tbody>
          </table>
        </div>

        <CreateUserForm groups={groups ?? []} />
      </div>
    </div>
  );
}
