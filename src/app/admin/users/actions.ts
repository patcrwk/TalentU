"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { UserRole } from "@/lib/supabase/types";

function generateTempPassword() {
  // 12 random chars from a readable alphabet, easy to relay verbally/in a text.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return pwd;
}

export async function createTeamMember(input: {
  email: string;
  display_name: string;
  role: UserRole;
  group_ids: string[];
}) {
  await requireAdmin();
  const serviceClient = createServiceRoleClient();
  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email: input.email.trim(),
    password: tempPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Failed to create account");
  }

  const { error: profileError } = await serviceClient.from("users").insert({
    id: created.user.id,
    role: input.role,
    display_name: input.display_name.trim(),
  });

  if (profileError) {
    await serviceClient.auth.admin.deleteUser(created.user.id);
    throw new Error(profileError.message);
  }

  if (input.group_ids.length > 0) {
    const { error: groupError } = await serviceClient
      .from("group_members")
      .insert(input.group_ids.map((group_id) => ({ group_id, user_id: created.user.id })));
    if (groupError) throw new Error(groupError.message);
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/groups");
  return { email: input.email.trim(), tempPassword };
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("users").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function deleteTeamMember(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("You can't remove your own account.");
  }

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin/groups");
}
