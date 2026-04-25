import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-bold">Admin only</h1>
        <p className="mt-2 text-neutral-600">
          Your account ({user.email}) doesn&apos;t have admin access. To grant
          access, run this in the Supabase SQL editor:
        </p>
        <pre className="mt-4 overflow-x-auto rounded bg-neutral-900 p-4 text-xs text-neutral-100">
{`update public.profiles set role = 'admin' where id = '${user.id}';`}
        </pre>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="mt-2 text-neutral-600">
        Welcome, {profile.display_name ?? user.email}.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/lessons/new"
          className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
        >
          <h2 className="font-semibold">+ New lesson</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Add a YouTube or Facebook video with notes.
          </p>
        </Link>
        <Link
          href="/admin/lessons"
          className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
        >
          <h2 className="font-semibold">All lessons</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Edit, reorder, publish, unpublish.
          </p>
        </Link>
      </div>
    </div>
  );
}
