import { createClient } from "@/lib/supabase/server";
import { CategoryCard } from "@/components/CategoryCard";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Resource Library</h1>
      <p className="mt-1 text-black/60">Browse resources by category.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
