"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createResource, updateResource, type ResourceInput } from "@/app/admin/resources/actions";
import type { AppUser, Category, Group, Resource, ResourceType } from "@/lib/supabase/types";

const RESOURCE_TYPES: ResourceType[] = ["article", "link", "file", "video"];

// Covers the content types called out in the brief: PDFs, Office docs
// (templates, seminar slides), and common images.
const UPLOADABLE_FILE_TYPES =
  "application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/png,image/jpeg,image/webp";

export function ResourceForm({
  categories,
  users,
  groups,
  resource,
  initialAssignedUserIds,
  initialAssignedGroupIds,
}: {
  categories: Category[];
  users: AppUser[];
  groups: Group[];
  resource?: Resource;
  initialAssignedUserIds?: string[];
  initialAssignedGroupIds?: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ResourceInput>({
    category_id: resource?.category_id ?? categories[0]?.id ?? "",
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    content: resource?.content ?? "",
    resource_type: resource?.resource_type ?? "article",
    external_url: resource?.external_url ?? "",
    file_url: resource?.file_url ?? "",
    file_alt_text: resource?.file_alt_text ?? "",
    is_featured: resource?.is_featured ?? false,
    is_published: resource?.is_published ?? false,
    assigned_user_ids: initialAssignedUserIds ?? [],
    assigned_group_ids: initialAssignedGroupIds ?? [],
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ResourceInput>(key: K, value: ResourceInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAssignment(key: "assigned_user_ids" | "assigned_group_ids", id: string) {
    setValues((prev) => {
      const current = prev[key];
      const next = current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id];
      return { ...prev, [key]: next };
    });
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resource-files")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("resource-files").getPublicUrl(path);
      set("file_url", data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (resource) {
        await updateResource(resource.id, values);
      } else {
        await createResource(values);
      }
      router.push("/admin/resources");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-brand-navy">Category</label>
        <select
          required
          value={values.category_id}
          onChange={(e) => set("category_id", e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy">Title</label>
        <input
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy">Short description</label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy">Type</label>
        <select
          value={values.resource_type}
          onChange={(e) => set("resource_type", e.target.value as ResourceType)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {values.resource_type === "article" && (
        <div>
          <label className="block text-sm font-medium text-brand-navy">
            Content (Markdown supported)
          </label>
          <textarea
            rows={10}
            value={values.content}
            onChange={(e) => set("content", e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 font-mono text-sm"
          />
        </div>
      )}

      {(values.resource_type === "link" || values.resource_type === "video") && (
        <div>
          <label className="block text-sm font-medium text-brand-navy">
            {values.resource_type === "video" ? "Video URL" : "Link URL"}
          </label>
          <input
            type="url"
            required
            value={values.external_url}
            onChange={(e) => set("external_url", e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          />
        </div>
      )}

      {values.resource_type === "file" && (
        <div>
          <label className="block text-sm font-medium text-brand-navy">
            File (PDF, Word, PowerPoint, Excel, or image)
          </label>
          <input
            type="file"
            accept={UPLOADABLE_FILE_TYPES}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="mt-1 block w-full text-sm"
          />
          {uploading && <p className="mt-1 text-sm text-black/50">Uploading...</p>}
          {values.file_url && (
            <p className="mt-1 truncate text-sm text-brand-navy/70">Uploaded: {values.file_url}</p>
          )}
          <label className="mt-3 block text-sm font-medium text-brand-navy">
            Alt text (for accessibility)
          </label>
          <input
            value={values.file_alt_text}
            onChange={(e) => set("file_alt_text", e.target.value)}
            placeholder="Describe this file for screen readers"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-navy">
          Assign to (curated — still visible to everyone in the library)
        </label>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Groups</p>
            <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-black/15 p-2">
              {groups.map((group) => (
                <label key={group.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.assigned_group_ids.includes(group.id)}
                    onChange={() => toggleAssignment("assigned_group_ids", group.id)}
                  />
                  {group.name}
                </label>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-black/40">No groups yet.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
              Individuals
            </p>
            <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-black/15 p-2">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.assigned_user_ids.includes(user.id)}
                    onChange={() => toggleAssignment("assigned_user_ids", user.id)}
                  />
                  {user.display_name}
                </label>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-black/40">No team members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-navy">
          <input
            type="checkbox"
            checked={values.is_featured}
            onChange={(e) => set("is_featured", e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-brand-navy">
          <input
            type="checkbox"
            checked={values.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
          />
          Published
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-brand-red px-5 py-2.5 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : resource ? "Save changes" : "Create resource"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/resources")}
          className="rounded-lg border border-black/15 px-5 py-2.5 font-semibold hover:bg-black/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
