"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-brand-navy">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-brand-navy">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-green-700">Password updated.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-red px-4 py-2.5 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
