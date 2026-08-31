import { getCurrentAppUser } from "@/lib/supabase/auth";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function AccountPage() {
  const user = await getCurrentAppUser();
  if (!user) return null; // middleware guarantees this won't render for signed-out visitors

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">My account</h1>
      <p className="mt-1 text-sm text-black/60">{user.display_name}</p>

      <h2 className="mt-8 text-lg font-bold text-brand-navy">Change password</h2>
      <div className="mt-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
