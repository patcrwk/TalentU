import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateGroupForm } from "@/components/admin/CreateGroupForm";

export default async function AdminGroupsPage() {
  const supabase = await createClient();
  const [{ data: groups }, { data: memberships }] = await Promise.all([
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_members").select("group_id"),
  ]);

  const memberCounts = new Map<string, number>();
  for (const m of memberships ?? []) {
    memberCounts.set(m.group_id, (memberCounts.get(m.group_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Groups</h1>
      <p className="mt-1 text-sm text-black/60">
        Group team members so you can assign curated resources to a whole team at once. Everyone
        can still browse the full library — grouping only affects what gets surfaced as
        &quot;assigned to you&quot;.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {groups?.map((group) => (
            <Link
              key={group.id}
              href={`/admin/groups/${group.id}`}
              className="block rounded-xl border border-black/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-brand-navy">{group.name}</h2>
                <span className="text-xs font-medium text-black/50">
                  {memberCounts.get(group.id) ?? 0} member
                  {memberCounts.get(group.id) === 1 ? "" : "s"}
                </span>
              </div>
              {group.description && (
                <p className="mt-1 text-sm text-black/60">{group.description}</p>
              )}
            </Link>
          ))}
          {groups?.length === 0 && <p className="text-black/50">No groups yet.</p>}
        </div>

        <CreateGroupForm />
      </div>
    </div>
  );
}
