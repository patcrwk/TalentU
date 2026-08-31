"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeamMember } from "@/app/admin/users/actions";
import type { UserRole } from "@/lib/supabase/types";

export function CreateUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("team_member");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);

    try {
      const res = await createTeamMember({ email, display_name: displayName, role });
      setResult(res);
      setEmail("");
      setDisplayName("");
      setRole("team_member");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <h2 className="font-bold text-brand-navy">Create account</h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-brand-navy">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-navy">Display name</label>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-navy">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          >
            <option value="team_member">Team member</option>
            <option value="admin">Admin</option>
          </select>
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
          {saving ? "Creating..." : "Create account"}
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-lg bg-brand-navy/5 p-4 text-sm">
          <p className="font-semibold text-brand-navy">Account created for {result.email}</p>
          <p className="mt-1 text-black/70">
            Temporary password: <code className="rounded bg-white px-1.5 py-0.5">{result.tempPassword}</code>
          </p>
          <p className="mt-1 text-black/50">
            Share this with them directly — it won&apos;t be shown again.
          </p>
        </div>
      )}
    </div>
  );
}
