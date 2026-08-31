import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { SaveButton } from "@/components/SaveButton";

const TYPE_LABELS: Record<string, string> = {
  article: "Article",
  link: "Link",
  pdf: "PDF",
  video: "Video",
};

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resource } = await supabase.from("resources").select("*").eq("id", id).single();
  if (!resource) notFound();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", resource.category_id)
    .single();

  const { data: existingSave } = user
    ? await supabase
        .from("saved_resources")
        .select("id")
        .eq("user_id", user.id)
        .eq("resource_id", resource.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {category && (
        <Link
          href={`/library/${category.slug}`}
          className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy"
        >
          ← {category.name}
        </Link>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
          {TYPE_LABELS[resource.resource_type]}
        </span>
        {resource.is_featured && (
          <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
            Featured
          </span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-bold text-brand-navy">{resource.title}</h1>
      {resource.description && <p className="mt-2 text-black/70">{resource.description}</p>}

      {user && (
        <div className="mt-5">
          <SaveButton
            resourceId={resource.id}
            userId={user.id}
            initiallySaved={!!existingSave}
          />
        </div>
      )}

      <div className="mt-8 space-y-6">
        {resource.content && (
          <article className="prose prose-neutral max-w-none">
            <ReactMarkdown>{resource.content}</ReactMarkdown>
          </article>
        )}

        {resource.external_url && (
          <a
            href={resource.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-brand-navy px-4 py-2 font-semibold text-white hover:bg-brand-navy-dark transition-colors"
          >
            Open link ↗
          </a>
        )}

        {resource.file_url && (
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-brand-navy px-4 py-2 font-semibold text-white hover:bg-brand-navy-dark transition-colors"
          >
            {resource.resource_type === "video" ? "Watch video ↗" : "Open file ↗"}
          </a>
        )}
      </div>
    </div>
  );
}
