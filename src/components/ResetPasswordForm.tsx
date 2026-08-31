"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid" | "done";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // The reset-link redirect lands here with a recovery token in the URL;
    // the browser client exchanges it for a session and fires this event.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    // Covers the case where the session was already established by the
    // time this component mounts (event fires before the listener attaches).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus((prev) => (prev === "checking" ? "ready" : prev));
    });

    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "checking" ? "invalid" : prev));
    }, 3000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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

    setStatus("done");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  if (status === "checking") {
    return <p className="text-sm text-black/60">Checking your reset link...</p>;
  }

  if (status === "invalid") {
    return (
      <p className="text-sm text-black/70">
        This link is invalid or has expired.{" "}
        <a href="/forgot-password" className="font-medium text-brand-red hover:underline">
          Request a new one
        </a>
        .
      </p>
    );
  }

  if (status === "done") {
    return <p className="text-sm text-green-700">Password updated — redirecting you in...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-red px-4 py-2.5 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}
