"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function createGroup(input: { name: string; description: string }) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groups")
    .insert({ name: input.name.trim(), description: input.description.trim() || null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
  return data.id;
}

export async function updateGroup(id: string, input: { name: string; description: string }) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("groups")
    .update({ name: input.name.trim(), description: input.description.trim() || null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
}

export async function deleteGroup(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
}

export async function setGroupMembers(groupId: string, userIds: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId);
  if (deleteError) throw new Error(deleteError.message);

  if (userIds.length > 0) {
    const { error: insertError } = await supabase
      .from("group_members")
      .insert(userIds.map((user_id) => ({ group_id: groupId, user_id })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/resources");
}
