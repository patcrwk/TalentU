import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Categories</h1>
      <p className="mt-1 text-sm text-black/60">
        The four categories are fixed for this MVP — edit their name, description, and order below.
      </p>

      <div className="mt-6 space-y-5">
        {categories?.map((category) => (
          <CategoryForm key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
