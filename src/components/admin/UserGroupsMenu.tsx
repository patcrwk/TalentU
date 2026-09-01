"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setUserGroups } from "@/app/admin/groups/actions";
import type { Group } from "@/lib/supabase/types";

export function UserGroupsMenu({
  userId,
  allGroups,
  memberGroupIds,
}: {
  userId: string;
  allGroups: Group[];
  memberGroupIds: string[];
}) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(memberGroupIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(groupId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await setUserGroups(userId, [...selected]);
      if (detailsRef.current) detailsRef.current.open = false;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save groups.");
    } finally {
      setSaving(false);
    }
  }

  const currentNames = allGroups
    .filter((g) => memberGroupIds.includes(g.id))
    .map((g) => g.name);

  return (
    <details ref={detailsRef} className="relative">
      <summary className="cursor-pointer list-none text-sm text-black/70 hover:text-brand-navy">
        {currentNames.length > 0 ? currentNames.join(", ") : (
          <span className="text-black/40">No groups</span>
        )}
      </summary>
      <div className="absolute left-0 z-10 mt-2 w-56 rounded-lg border border-black/15 bg-white p-3 shadow-lg">
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {allGroups.map((group) => (
            <label key={group.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(group.id)}
                onChange={() => toggle(group.id)}
              />
              {group.name}
            </label>
          ))}
          {allGroups.length === 0 && (
            <p className="text-sm text-black/40">No groups yet.</p>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs text-brand-red">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-2 w-full rounded-lg bg-brand-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-navy-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </details>
  );
}
