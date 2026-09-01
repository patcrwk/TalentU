"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setGroupMembers } from "@/app/admin/groups/actions";
import type { AppUser } from "@/lib/supabase/types";

export function GroupMembersForm({
  groupId,
  users,
  memberIds,
}: {
  groupId: string;
  users: AppUser[];
  memberIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set(memberIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await setGroupMembers(groupId, [...selected]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save members.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl rounded-xl border border-black/10 bg-white p-5">
      <h2 className="font-bold text-brand-navy">Members</h2>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {users.map((user) => (
          <label key={user.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(user.id)}
              onChange={() => toggle(user.id)}
            />
            {user.display_name}
          </label>
        ))}
        {users.length === 0 && <p className="text-sm text-black/50">No team members yet.</p>}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-brand-red">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-brand-navy px-4 py-2 font-semibold text-white hover:bg-brand-navy-dark transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save members"}
      </button>
    </div>
  );
}
