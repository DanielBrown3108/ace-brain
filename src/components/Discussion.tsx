"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  user_id: string;
  body: string;
  pinned: boolean;
  created_at: string;
  author_email: string | null;
};

type Props = {
  lessonId: string;
};

export function Discussion({ lessonId }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [me, setMe] = useState<{ id: string; email: string | null } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setMe(user ? { id: user.id, email: user.email ?? null } : null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled) setIsAdmin(profile?.role === "admin");
      }

      await load();
    })();

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("lesson_comments")
        .select("id, user_id, body, pinned, created_at, profiles(display_name)")
        .eq("lesson_id", lessonId)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setComments(
        (data ?? []).map((c) => {
          const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          return {
            id: c.id as string,
            user_id: c.user_id as string,
            body: c.body as string,
            pinned: c.pinned as boolean,
            created_at: c.created_at as string,
            author_email: (p as { display_name: string } | null)?.display_name ?? null,
          };
        })
      );
    }

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function post() {
    if (!me || !draft.trim()) return;
    const supabase = createClient();
    setError(null);
    const { error } = await supabase
      .from("lesson_comments")
      .insert({ lesson_id: lessonId, user_id: me.id, body: draft.trim() });
    if (error) {
      setError(error.message);
      return;
    }
    setDraft("");
    startTransition(async () => {
      const { data } = await supabase
        .from("lesson_comments")
        .select("id, user_id, body, pinned, created_at, profiles(display_name)")
        .eq("lesson_id", lessonId)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      setComments(
        (data ?? []).map((c) => {
          const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          return {
            id: c.id as string,
            user_id: c.user_id as string,
            body: c.body as string,
            pinned: c.pinned as boolean,
            created_at: c.created_at as string,
            author_email: (p as { display_name: string } | null)?.display_name ?? null,
          };
        })
      );
    });
  }

  async function togglePin(c: Comment) {
    const supabase = createClient();
    await supabase
      .from("lesson_comments")
      .update({ pinned: !c.pinned })
      .eq("id", c.id);
    setComments((prev) =>
      prev
        ? prev
            .map((x) => (x.id === c.id ? { ...x, pinned: !c.pinned } : x))
            .sort((a, b) =>
              a.pinned === b.pinned
                ? b.created_at.localeCompare(a.created_at)
                : a.pinned
                  ? -1
                  : 1
            )
        : prev
    );
  }

  async function remove(c: Comment) {
    if (!confirm("Delete this comment?")) return;
    const supabase = createClient();
    await supabase.from("lesson_comments").delete().eq("id", c.id);
    setComments((prev) => (prev ? prev.filter((x) => x.id !== c.id) : prev));
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">Discussion</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Ask questions, share your mind maps, help each other.
      </p>

      {me ? (
        <div className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Write a comment or question..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={post}
            disabled={pending || !draft.trim()}
            className="mt-2 rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {comments === null && (
          <li className="text-sm text-neutral-400">Loading...</li>
        )}
        {comments && comments.length === 0 && (
          <li className="text-sm text-neutral-500">
            No comments yet. Be the first.
          </li>
        )}
        {comments?.map((c) => (
          <li
            key={c.id}
            className={`rounded-2xl border p-4 ${
              c.pinned
                ? "border-blue-200 bg-blue-50"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {c.pinned && (
                  <span className="mr-2 inline-flex items-center rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                    Pinned
                  </span>
                )}
                {c.author_email ?? "Student"}
              </span>
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">
              {c.body}
            </p>
            {(isAdmin || me?.id === c.user_id) && (
              <div className="mt-3 flex gap-3 text-xs">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => togglePin(c)}
                    className="text-blue-700 hover:underline"
                  >
                    {c.pinned ? "Unpin" : "Pin"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
