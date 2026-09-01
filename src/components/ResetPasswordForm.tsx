"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid" | "done";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Preferred path: the email template links here with ?token_hash=...
    // (not straight to Supabase's own /auth/v1/verify link) specifically so
    // that email-scanner prefetching of the link in the inbox doesn't burn
    // the one-time token before the user actually clicks it — verifyOtp only
    // runs when this page's JS actually executes in a real browser.
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    async function verifyFromTokenHash() {
      if (!tokenHash || type !== "recovery") return false;
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (!cancelled) setStatus(error ? "invalid" : "ready");
      return true;
    }

    // Fallback path: the older hash-fragment flow (Supabase's default
    // ConfirmationURL template), kept for compatibility until the email
    // template is switched over.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    verifyFromTokenHash().then((handled) => {
      if (handled || cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled && data.session) setStatus((prev) => (prev === "checking" ? "ready" : prev));
      });
    });

    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "checking" ? "invalid" : prev));
    }, 3000);

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

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
