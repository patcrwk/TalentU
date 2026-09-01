import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: resource }, { data: categories }, { data: users }, { data: groups }, { data: assignments }] =
    await Promise.all([
      supabase.from("resources").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("users").select("*").order("display_name"),
      supabase.from("groups").select("*").order("name"),
      supabase.from("resource_assignments").select("user_id, group_id").eq("resource_id", id),
    ]);

  if (!resource) notFound();

  const initialAssignedUserIds = (assignments ?? []).flatMap((a) => (a.user_id ? [a.user_id] : []));
  const initialAssignedGroupIds = (assignments ?? []).flatMap((a) => (a.group_id ? [a.group_id] : []));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Edit resource</h1>
      <div className="mt-6">
        <ResourceForm
          categories={categories ?? []}
          users={users ?? []}
          groups={groups ?? []}
          resource={resource}
          initialAssignedUserIds={initialAssignedUserIds}
          initialAssignedGroupIds={initialAssignedGroupIds}
        />
      </div>
    </div>
  );
}
