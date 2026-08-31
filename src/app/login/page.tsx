import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-20">
      <h1 className="mb-1 text-2xl font-bold text-brand-navy">Welcome back</h1>
      <p className="mb-6 text-sm text-black/60">
        Sign in with the account your admin set up for you.
      </p>
      <LoginForm next={next ?? "/"} />
    </div>
  );
}
