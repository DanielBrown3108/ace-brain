import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  position: number;
  published: boolean;
  units: {
    slug: string;
    title: string;
    courses: { slug: string; title: string };
  };
};

function flattenJoined<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // Recent completions.
  const { data: completed } = await supabase
    .from("lesson_progress")
    .select(
      "completed_at, lessons!inner(id, slug, title, position, published, units!inner(slug, title, courses!inner(slug, title)))"
    )
    .order("completed_at", { ascending: false })
    .limit(10);

  const completedRows = (completed ?? []).map((r) => {
    const lesson = flattenJoined(
      r.lessons as unknown as LessonRow | LessonRow[]
    );
    return { completed_at: r.completed_at as string, lesson };
  });

  // Find the next lesson in the most-recent course the user touched.
  let nextUp: {
    courseSlug: string;
    unitSlug: string;
    lessonSlug: string;
    title: string;
    courseTitle: string;
  } | null = null;

  const lastLesson = completedRows[0]?.lesson;
  if (lastLesson) {
    const unit = flattenJoined(lastLesson.units);
    const course = unit ? flattenJoined(unit.courses) : undefined;
    if (course) {
      const { data: courseRow } = await supabase
        .from("courses")
        .select(
          "id, slug, title, units(id, slug, position, lessons(id, slug, title, position, published))"
        )
        .eq("slug", course.slug)
        .maybeSingle();

      const allLessons = ((courseRow?.units ?? []) as Array<{
        slug: string;
        position: number;
        lessons: Array<{ id: string; slug: string; title: string; position: number; published: boolean }>;
      }>)
        .sort((a, b) => a.position - b.position)
        .flatMap((u) =>
          (u.lessons ?? [])
            .filter((l) => l.published)
            .sort((a, b) => a.position - b.position)
            .map((l) => ({ unitSlug: u.slug, lesson: l }))
        );

      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id");
      const doneIds = new Set((progressRows ?? []).map((p) => p.lesson_id));

      const nextItem = allLessons.find((x) => !doneIds.has(x.lesson.id));
      if (nextItem && courseRow) {
        nextUp = {
          courseSlug: courseRow.slug,
          unitSlug: nextItem.unitSlug,
          lessonSlug: nextItem.lesson.slug,
          title: nextItem.lesson.title,
          courseTitle: courseRow.title,
        };
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your dashboard</h1>
      <p className="mt-2 text-neutral-600">
        Welcome back, {user.email}.
      </p>

      {nextUp ? (
        <Link
          href={`/courses/${nextUp.courseSlug}/${nextUp.unitSlug}/${nextUp.lessonSlug}`}
          className="mt-8 block rounded-2xl border border-emerald-200 bg-emerald-50 p-6 hover:bg-emerald-100"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-700">
            Continue learning
          </p>
          <p className="mt-2 text-xl font-semibold">{nextUp.title}</p>
          <p className="mt-1 text-sm text-neutral-600">{nextUp.courseTitle}</p>
        </Link>
      ) : (
        <div className="mt-8 rounded-2xl border border-neutral-200 p-6">
          <p className="font-medium">Start a course</p>
          <p className="mt-1 text-sm text-neutral-600">
            You haven&apos;t completed any lessons yet.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Browse courses
          </Link>
        </div>
      )}

      <h2 className="mt-12 text-lg font-semibold">Recently completed</h2>
      {completedRows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">Nothing yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {completedRows.map((r, i) => {
            const lesson = r.lesson;
            if (!lesson) return null;
            const unit = flattenJoined(lesson.units);
            const course = unit ? flattenJoined(unit.courses) : undefined;
            return (
              <li key={`${lesson.id}-${i}`}>
                <Link
                  href={`/courses/${course?.slug}/${unit?.slug}/${lesson.slug}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
                >
                  <span>
                    <span className="block">{lesson.title}</span>
                    <span className="block text-xs text-neutral-500">
                      {course?.title}
                    </span>
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(r.completed_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
