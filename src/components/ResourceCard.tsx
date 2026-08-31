import Link from "next/link";
import type { Resource } from "@/lib/supabase/types";

const TYPE_LABELS: Record<Resource["resource_type"], string> = {
  article: "Article",
  link: "Link",
  file: "File",
  video: "Video",
};

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/resource/${resource.id}`}
      className="block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
          {TYPE_LABELS[resource.resource_type]}
        </span>
        {resource.is_featured && (
          <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
            Featured
          </span>
        )}
      </div>
      <h3 className="mt-3 text-lg font-bold text-brand-navy">{resource.title}</h3>
      {resource.description && (
        <p className="mt-1 line-clamp-2 text-sm text-black/60">{resource.description}</p>
      )}
    </Link>
  );
}
