"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Props = {
  lessonId: string;
};

export function MarkComplete({ lessonId }: Props) {
  const [state, setState] = useState<
    "loading" | "anonymous" | "incomplete" | "complete" | "saving"
  >("loading");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setState("anonymous");
        return;
      }
      const { data } = await supabase
        .from("lesson_progress")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (cancelled) return;
      setState(data ? "complete" : "incomplete");
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (state === "loading") {
    return (
      <div className="h-10 w-40 animate-pulse rounded-full bg-neutral-100" />
    );
  }

  if (state === "anonymous") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname : "/"
        )}`}
        className="inline-flex items-center rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        Sign in to track progress
      </Link>
    );
  }

  async function toggle() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setState("saving");

    if (state === "complete") {
      await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
      setState("incomplete");
    } else {
      await supabase.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: lessonId,
      });
      setState("complete");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={state === "saving"}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
        state === "complete"
          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
          : "bg-blue-700 text-white hover:bg-blue-800"
      } disabled:opacity-50`}
    >
      {state === "complete" ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
