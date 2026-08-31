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

  const [{ data: resource }, { data: categories }] = await Promise.all([
    supabase.from("resources").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Edit resource</h1>
      <div className="mt-6">
        <ResourceForm categories={categories ?? []} resource={resource} />
      </div>
    </div>
  );
}
