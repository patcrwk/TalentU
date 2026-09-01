import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Resource IDs assigned to this user directly or through a group they
 * belong to. Filters explicitly by userId/groupIds rather than relying on
 * RLS's admin bypass, so it stays correct for admins viewing their own
 * "assigned to you" surface (not everyone's assignments).
 */
export async function getAssignedResourceIds(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Set<string>> {
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const groupIds = (memberships ?? []).map((m) => m.group_id);
  const filters = [`user_id.eq.${userId}`];
  if (groupIds.length > 0) filters.push(`group_id.in.(${groupIds.join(",")})`);

  const { data: assignments } = await supabase
    .from("resource_assignments")
    .select("resource_id")
    .or(filters.join(","));

  return new Set((assignments ?? []).map((a) => a.resource_id));
}
