"use client";

import { useState } from "react";
import { updateCategory } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/supabase/types";

export function CategoryForm({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [sortOrder, setSortOrder] = useState(category.sort_order);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateCategory(category.id, { name, description, sort_order: sortOrder });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-black/10 bg-white p-5">
      <div>
        <label className="block text-sm font-medium text-brand-navy">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium text-brand-navy">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>
      <div className="mt-3 w-32">
        <label className="block text-sm font-medium text-brand-navy">Sort order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-navy px-4 py-2 font-semibold text-white hover:bg-brand-navy-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-700">Saved</span>}
      </div>
    </form>
  );
}
