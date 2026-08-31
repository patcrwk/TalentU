import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResourceRow } from "@/components/admin/ResourceRow";

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  const [{ data: resources }, { data: categories }] = await Promise.all([
    supabase.from("resources").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*"),
  ]);

  const categoryNames = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Resources</h1>
        <Link
          href="/admin/resources/new"
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark transition-colors"
        >
          New resource
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/15 text-sm text-black/50">
              <th className="pb-2 pr-4 font-medium">Title</th>
              <th className="pb-2 pr-4 font-medium">Category</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Featured</th>
            </tr>
          </thead>
          <tbody>
            {resources?.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                categoryName={categoryNames.get(resource.category_id) ?? "—"}
              />
            ))}
          </tbody>
        </table>
        {resources?.length === 0 && (
          <p className="mt-6 text-center text-black/50">No resources yet.</p>
        )}
      </div>
    </div>
  );
}
