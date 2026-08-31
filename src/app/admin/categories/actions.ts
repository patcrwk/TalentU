"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function updateCategory(
  id: string,
  input: { name: string; description: string; sort_order: number }
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      sort_order: input.sort_order,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/library");
  revalidatePath("/");
}
