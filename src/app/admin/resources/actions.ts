"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { ResourceType, Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ResourceInput {
  category_id: string;
  title: string;
  description: string;
  content: string;
  resource_type: ResourceType;
  external_url: string;
  file_url: string;
  file_alt_text: string;
  is_featured: boolean;
  is_published: boolean;
  assigned_user_ids: string[];
  assigned_group_ids: string[];
}

function toRow(input: ResourceInput) {
  return {
    category_id: input.category_id,
    title: input.title.trim(),
    description: input.description.trim() || null,
    content: input.content.trim() || null,
    resource_type: input.resource_type,
    external_url: input.external_url.trim() || null,
    file_url: input.file_url.trim() || null,
    file_alt_text: input.file_alt_text.trim() || null,
    is_featured: input.is_featured,
    is_published: input.is_published,
  };
}

async function syncAssignments(
  supabase: SupabaseClient<Database>,
  resourceId: string,
  input: ResourceInput
) {
  const { error: deleteError } = await supabase
    .from("resource_assignments")
    .delete()
    .eq("resource_id", resourceId);
  if (deleteError) throw new Error(deleteError.message);

  const rows = [
    ...input.assigned_user_ids.map((user_id) => ({
      resource_id: resourceId,
      user_id,
      group_id: null,
    })),
    ...input.assigned_group_ids.map((group_id) => ({
      resource_id: resourceId,
      group_id,
      user_id: null,
    })),
  ];

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("resource_assignments").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }
}

export async function createResource(input: ResourceInput) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .insert({ ...toRow(input), created_by: admin.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await syncAssignments(supabase, data.id, input);

  revalidatePath("/admin/resources");
  revalidatePath("/library");
  revalidatePath("/");
}

export async function updateResource(id: string, input: ResourceInput) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("resources").update(toRow(input)).eq("id", id);

  if (error) throw new Error(error.message);
  await syncAssignments(supabase, id, input);

  revalidatePath("/admin/resources");
  revalidatePath("/library");
  revalidatePath("/");
  revalidatePath(`/resource/${id}`);
}

export async function toggleResourceField(
  id: string,
  field: "is_published" | "is_featured",
  value: boolean
) {
  await requireAdmin();
  const supabase = await createClient();

  const update = field === "is_published" ? { is_published: value } : { is_featured: value };
  const { error } = await supabase.from("resources").update(update).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  revalidatePath("/library");
  revalidatePath("/");
}
