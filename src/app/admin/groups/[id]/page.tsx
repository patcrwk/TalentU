import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GroupForm } from "@/components/admin/GroupForm";
import { GroupMembersForm } from "@/components/admin/GroupMembersForm";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: group }, { data: users }, { data: memberships }] = await Promise.all([
    supabase.from("groups").select("*").eq("id", id).single(),
    supabase.from("users").select("*").order("display_name"),
    supabase.from("group_members").select("user_id").eq("group_id", id),
  ]);

  if (!group) notFound();

  const memberIds = (memberships ?? []).map((m) => m.user_id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Edit group</h1>
      <div className="mt-6 space-y-8">
        <GroupForm group={group} />
        <GroupMembersForm groupId={group.id} users={users ?? []} memberIds={memberIds} />
      </div>
    </div>
  );
}
