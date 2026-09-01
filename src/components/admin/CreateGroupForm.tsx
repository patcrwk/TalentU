"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/app/admin/groups/actions";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const id = await createGroup({ name, description });
      router.push(`/admin/groups/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group.");
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <h2 className="font-bold text-brand-navy">Create group</h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
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

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create group"}
        </button>
      </form>
    </div>
  );
}
