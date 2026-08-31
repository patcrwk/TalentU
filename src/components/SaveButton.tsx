"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SaveButton({
  resourceId,
  userId,
  initiallySaved,
}: {
  resourceId: string;
  userId: string;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const supabase = createClient();

      if (saved) {
        await supabase
          .from("saved_resources")
          .delete()
          .eq("user_id", userId)
          .eq("resource_id", resourceId);
      } else {
        await supabase.from("saved_resources").insert({ user_id: userId, resource_id: resourceId });
      }

      setSaved(!saved);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-full px-5 py-2 font-semibold transition-colors disabled:opacity-60 ${
        saved
          ? "bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/20"
          : "bg-brand-red text-white hover:bg-brand-red-dark"
      }`}
    >
      {saved ? "Saved ✓" : "Save resource"}
    </button>
  );
}
