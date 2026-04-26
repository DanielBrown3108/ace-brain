import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("published", true)
    .maybeSingle();

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, slug, title, position, lessons(id, slug, title, position, published)")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  // Pull this user's completed lessons (RLS limits to their own rows).
  const { data: { user } } = await supabase.auth.getUser();
  const { data: progress } = user
    ? await supabase.from("lesson_progress").select("lesson_id")
    : { data: [] as { lesson_id: string }[] };
  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));

  const allPublished =
    units?.flatMap((u) => (u.lessons ?? []).filter((l) => l.published)) ?? [];
  const overallTotal = allPublished.length;
  const overallDone = allPublished.filter((l) => doneIds.has(l.id)).length;
  const overallPct = overallTotal
    ? Math.round((overallDone / overallTotal) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/courses" className="text-sm text-neutral-500 hover:underline">
        &larr; All courses
      </Link>

      {course.cover_image_url && (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-[#f5ede0]">
          <Image
            src={course.cover_image_url}
            alt=""
            width={1200}
            height={675}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{course.title}</h1>
      {course.description && (
        <p className="mt-2 text-neutral-600">{course.description}</p>
      )}

      {user && overallTotal > 0 && (
        <div className="mt-6 rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-neutral-600">
              {overallDone} / {overallTotal} lessons · {overallPct}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-blue-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-10 space-y-8">
        {units?.map((u) => {
          const lessons = (u.lessons ?? [])
            .filter((l) => l.published)
            .sort((a, b) => a.position - b.position);
          const unitDone = lessons.filter((l) => doneIds.has(l.id)).length;
          return (
            <section key={u.id}>
              <div className="flex items-end justify-between">
                <h2 className="text-lg font-semibold">{u.title}</h2>
                {user && lessons.length > 0 && (
                  <span className="text-xs text-neutral-500">
                    {unitDone} / {lessons.length} done
                  </span>
                )}
              </div>
              <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                {lessons.length === 0 && (
                  <li className="px-4 py-3 text-sm text-neutral-500">
                    No lessons published yet.
                  </li>
                )}
                {lessons.map((l, i) => {
                  const done = doneIds.has(l.id);
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/courses/${course.slug}/${u.slug}/${l.slug}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
                      >
                        <span className="flex items-center">
                          <span
                            className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                              done
                                ? "bg-blue-700 text-white"
                                : "bg-neutral-100 text-neutral-400"
                            }`}
                          >
                            {done ? "✓" : i + 1}
                          </span>
                          <span className={done ? "text-neutral-500" : ""}>
                            {l.title}
                          </span>
                        </span>
                        <span className="text-sm text-neutral-400">
                          {done ? "Review" : "Watch"} &rarr;
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
