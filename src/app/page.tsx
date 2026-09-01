import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryCard } from "@/components/CategoryCard";
import { ResourceCard } from "@/components/ResourceCard";
import { getAssignedResourceIds } from "@/lib/supabase/assignments";
import type { Resource } from "@/lib/supabase/types";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: featured }, assignedIds] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("updated_at", { ascending: false })
      .limit(6),
    user ? getAssignedResourceIds(supabase, user.id) : Promise.resolve(new Set<string>()),
  ]);

  let assignedResources: Resource[] = [];
  if (assignedIds.size > 0) {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .in("id", [...assignedIds])
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(6);
    assignedResources = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-brand-navy px-8 py-12 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Grow with TalentU</h1>
        <p className="mt-3 max-w-xl text-white/85">
          Resources to help you grow financially, personally, relationally, and as a leader.
        </p>
        <Link
          href="/library"
          className="mt-6 inline-block rounded-full bg-brand-red px-5 py-2.5 font-semibold hover:bg-brand-red-dark transition-colors"
        >
          Browse the library
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-brand-navy">Categories</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {assignedResources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-brand-navy">Assigned to you</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} isAssigned />
            ))}
          </div>
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-brand-navy">Featured resources</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isAssigned={assignedIds.has(resource.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
