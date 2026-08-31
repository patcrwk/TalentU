import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: resourceCount }, { count: publishedCount }, { count: userCount }] =
    await Promise.all([
      supabase.from("resources").select("*", { count: "exact", head: true }),
      supabase
        .from("resources")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Total resources", value: resourceCount ?? 0, href: "/admin/resources" },
    { label: "Published resources", value: publishedCount ?? 0, href: "/admin/resources" },
    { label: "Team members", value: userCount ?? 0, href: "/admin/users" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Admin dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-black/10 bg-white p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-brand-navy">{stat.value}</p>
            <p className="mt-1 text-sm text-black/60">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
