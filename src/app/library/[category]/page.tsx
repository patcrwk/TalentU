import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResourceCard } from "@/components/ResourceCard";
import { getAssignedResourceIds } from "@/lib/supabase/assignments";
import type { ResourceType } from "@/lib/supabase/types";

const RESOURCE_TYPES: ResourceType[] = ["article", "link", "file", "video"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { category: slug } = await params;
  const { q, type } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  let query = supabase
    .from("resources")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (type && RESOURCE_TYPES.includes(type as ResourceType)) {
    query = query.eq("resource_type", type as ResourceType);
  }

  const [{ data: resources }, assignedIds] = await Promise.all([
    query,
    user ? getAssignedResourceIds(supabase, user.id) : Promise.resolve(new Set<string>()),
  ]);

  // Curated resources surface first without hiding anything else from the library.
  const sorted = [...(resources ?? [])].sort(
    (a, b) => Number(assignedIds.has(b.id)) - Number(assignedIds.has(a.id))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">{category.name}</h1>
      {category.description && <p className="mt-1 text-black/60">{category.description}</p>}

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search this category..."
          className="min-w-[220px] flex-1 rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        >
          <option value="">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand-navy px-4 py-2 font-semibold text-white hover:bg-brand-navy-dark transition-colors"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} isAssigned={assignedIds.has(resource.id)} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="mt-10 text-center text-black/50">No resources match yet.</p>
      )}
    </div>
  );
}
