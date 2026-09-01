"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, deleteTeamMember } from "@/app/admin/users/actions";
import { UserGroupsMenu } from "./UserGroupsMenu";
import type { AppUser, Group, UserRole } from "@/lib/supabase/types";

export function UserRow({
  user,
  isSelf,
  allGroups,
  memberGroupIds,
}: {
  user: AppUser;
  isSelf: boolean;
  allGroups: Group[];
  memberGroupIds: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(role: UserRole) {
    startTransition(() => updateUserRole(user.id, role));
  }

  async function handleRemove() {
    if (
      !confirm(
        `Remove ${user.display_name}? This deletes their account and sign-in access — they'll lose any saved resources and goal notes.`
      )
    )
      return;
    setRemoving(true);
    setError(null);
    try {
      await deleteTeamMember(user.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove.");
      setRemoving(false);
    }
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
      <td className="py-3 pr-4">
        <UserGroupsMenu userId={user.id} allGroups={allGroups} memberGroupIds={memberGroupIds} />
      </td>
      <td className="py-3 pr-4">
        {!isSelf && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="text-sm font-medium text-brand-red/70 hover:text-brand-red disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        )}
        {error && (
          <p role="alert" className="mt-1 text-xs text-brand-red">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
