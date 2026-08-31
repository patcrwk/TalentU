"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Always show the same confirmation, whether or not the email is
    // registered — avoids revealing which emails have accounts.
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-black/70">
        If an account exists for <strong>{email}</strong>, a reset link is on
        its way. Check your inbox (and spam folder).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-navy">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-brand-red px-4 py-2.5 font-semibold text-white hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        {sending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
