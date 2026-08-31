import Link from "next/link";
import { categoryBgClass } from "@/lib/categoryColors";
import type { Category } from "@/lib/supabase/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/library/${category.slug}`}
      className={`block rounded-2xl p-6 text-white shadow-sm transition-transform hover:scale-[1.02] ${categoryBgClass(
        category.slug
      )}`}
    >
      <h3 className="text-xl font-bold">{category.name}</h3>
      {category.description && (
        <p className="mt-2 text-sm text-white/90">{category.description}</p>
      )}
    </Link>
  );
}
