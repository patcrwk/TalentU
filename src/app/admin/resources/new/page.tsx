import { createClient } from "@/lib/supabase/server";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function NewResourcePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">New resource</h1>
      <div className="mt-6">
        <ResourceForm categories={categories ?? []} />
      </div>
    </div>
  );
}
