"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateGroup, deleteGroup } from "@/app/admin/groups/actions";
import type { Group } from "@/lib/supabase/types";

export function GroupForm({ group }: { group: Group }) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateGroup(group.id, { name, description });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${group.name}"? Resources assigned to this group will no longer be assigned to it.`
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteGroup(group.id);
      router.push("/admin/groups");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-black/10 bg-white p-5"
    >
      <div>
        <label className="block text-sm font-medium text-brand-navy">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-navy">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-medium text-brand-red/70 hover:text-brand-red disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete group"}
        </button>
      </div>
    </form>
  );
}
