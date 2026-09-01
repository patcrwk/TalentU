import { createClient } from "@/lib/supabase/server";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function NewResourcePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: users }, { data: groups }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("users").select("*").order("display_name"),
    supabase.from("groups").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">New resource</h1>
      <div className="mt-6">
        <ResourceForm categories={categories ?? []} users={users ?? []} groups={groups ?? []} />
      </div>
    </div>
  );
}
