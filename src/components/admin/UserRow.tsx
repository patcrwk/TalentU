"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/app/admin/users/actions";
import type { AppUser, UserRole } from "@/lib/supabase/types";

export function UserRow({ user, isSelf }: { user: AppUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(role: UserRole) {
    startTransition(() => updateUserRole(user.id, role));
  }

  return (
    <tr className="border-b border-black/10">
      <td className="py-3 pr-4 font-medium text-brand-navy">
        {user.display_name}
        {isSelf && <span className="ml-2 text-xs font-normal text-black/40">(you)</span>}
      </td>
      <td className="py-3 pr-4">
        <select
          value={user.role}
          disabled={isPending || isSelf}
          onChange={(e) => handleChange(e.target.value as UserRole)}
          className="rounded-lg border border-black/15 px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="team_member">Team member</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="py-3 pr-4 text-sm text-black/50">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}
