import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AllLessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/lessons");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/admin");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title, published, video_source, units(title, courses(title))")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
        <Link
          href="/admin/lessons/new"
          className="rounded-full bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + New lesson
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {lessons?.length === 0 && (
          <li className="px-4 py-3 text-sm text-neutral-500">No lessons yet.</li>
        )}
        {lessons?.map((l) => {
          const rawUnit = Array.isArray(l.units) ? l.units[0] : l.units;
          const unit = rawUnit as
            | { title: string; courses: { title: string } | { title: string }[] | null }
            | null;
          const course = unit
            ? Array.isArray(unit.courses)
              ? unit.courses[0]
              : unit.courses
            : null;
          return (
            <li key={l.id}>
              <Link
                href={`/admin/lessons/${l.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="text-xs text-neutral-500">
                    {course?.title} — {unit?.title} · {l.video_source}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs ${
                    l.published
                      ? "bg-blue-100 text-blue-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {l.published ? "Published" : "Draft"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
