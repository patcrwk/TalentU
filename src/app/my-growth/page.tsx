import { createClient } from "@/lib/supabase/server";
import { ResourceCard } from "@/components/ResourceCard";
import { GoalNotes } from "@/components/GoalNotes";
import type { Resource } from "@/lib/supabase/types";

export default async function MyGrowthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware guarantees this won't render for signed-out visitors

  const [{ data: saves }, { data: notes }] = await Promise.all([
    supabase
      .from("saved_resources")
      .select("id, saved_at, resource:resources(*)")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false }),
    supabase
      .from("goal_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const savedResources = (saves ?? [])
    .map((s) => s.resource as unknown as Resource | null)
    .filter((r): r is Resource => r !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">My Growth</h1>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-brand-navy">Saved resources</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
        {savedResources.length === 0 && (
          <p className="mt-2 text-sm text-black/50">
            You haven&apos;t saved any resources yet. Browse the library to find some.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-brand-navy">Goal notes</h2>
        <div className="mt-4">
          <GoalNotes userId={user.id} initialNotes={notes ?? []} />
        </div>
      </section>
    </div>
  );
}
