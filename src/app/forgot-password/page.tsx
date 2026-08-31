import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-20">
      <h1 className="mb-1 text-2xl font-bold text-brand-navy">Reset your password</h1>
      <p className="mb-6 text-sm text-black/60">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>
      <ForgotPasswordForm />
      <Link
        href="/login"
        className="mt-6 text-sm font-medium text-brand-navy hover:underline"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
