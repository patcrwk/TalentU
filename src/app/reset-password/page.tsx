import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-20">
      <h1 className="mb-1 text-2xl font-bold text-brand-navy">Set a new password</h1>
      <p className="mb-6 text-sm text-black/60">Choose a new password for your account.</p>
      <Suspense fallback={<p className="text-sm text-black/60">Checking your reset link...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
