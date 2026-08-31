"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleResourceField } from "@/app/admin/resources/actions";
import type { Resource } from "@/lib/supabase/types";

export function ResourceRow({ resource, categoryName }: { resource: Resource; categoryName: string }) {
  const [isPending, startTransition] = useTransition();

  function toggle(field: "is_published" | "is_featured", value: boolean) {
    startTransition(() => toggleResourceField(resource.id, field, value));
  }

  return (
    <tr className="border-b border-black/10">
      <td className="py-3 pr-4">
        <Link href={`/admin/resources/${resource.id}`} className="font-medium text-brand-navy hover:underline">
          {resource.title}
        </Link>
      </td>
      <td className="py-3 pr-4 text-sm text-black/60">{categoryName}</td>
      <td className="py-3 pr-4 text-sm capitalize text-black/60">{resource.resource_type}</td>
      <td className="py-3 pr-4">
        <button
          disabled={isPending}
          onClick={() => toggle("is_published", !resource.is_published)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            resource.is_published ? "bg-green-100 text-green-800" : "bg-black/10 text-black/60"
          }`}
        >
          {resource.is_published ? "Published" : "Unpublished"}
        </button>
      </td>
      <td className="py-3 pr-4">
        <button
          disabled={isPending}
          onClick={() => toggle("is_featured", !resource.is_featured)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            resource.is_featured ? "bg-brand-red/10 text-brand-red" : "bg-black/10 text-black/60"
          }`}
        >
          {resource.is_featured ? "Featured" : "Not featured"}
        </button>
      </td>
    </tr>
  );
}
