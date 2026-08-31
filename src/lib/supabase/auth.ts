import { createClient } from "./server";
import type { AppUser } from "./types";

/** Returns the signed-in user's profile row, or null if signed out. */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
  return data ?? null;
}

/** Throws-free guard for server actions/pages: returns the user only if they're an admin. */
export async function requireAdmin(): Promise<AppUser> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "admin") {
    throw new Error("Admin access required");
  }
  return appUser;
}
