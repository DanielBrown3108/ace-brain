import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeBadges, type Badge } from "@/lib/badges";

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

  // Streak + counts. Pull all completion timestamps for derivation.
  const { data: allProgress } = await supabase
    .from("lesson_progress")
    .select("completed_at");

  const totalDone = (allProgress ?? []).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const doneThisWeek = (allProgress ?? []).filter(
    (r) => new Date(r.completed_at as string) >= sevenDaysAgo
  ).length;

  // Streak = consecutive days (counting today or yesterday as the start)
  // with at least one completed lesson, walking backwards.
  const dayKeys = new Set(
    (allProgress ?? []).map((r) => {
      const d = new Date(r.completed_at as string);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  function dayKey(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  let streak = 0;
  const cursor = new Date();
  // Allow today OR yesterday as the streak anchor (so missing today before
  // bedtime doesn't reset the streak).
  if (!dayKeys.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(dayKey(cursor))) {
      streak = 0;
    } else {
      streak = 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else {
    streak = 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dayKeys.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak ever (for the badge), and most lessons in any single day.
  const sortedDayKeys = Array.from(dayKeys).sort();
  let longestStreak = 0;
  let runStreak = 0;
  let prevKey: string | null = null;
  for (const key of sortedDayKeys) {
    if (prevKey === null) {
      runStreak = 1;
    } else {
      const [py, pm, pd] = prevKey.split("-").map(Number);
      const prevDate = new Date(py, pm, pd);
      prevDate.setDate(prevDate.getDate() + 1);
      runStreak = dayKey(prevDate) === key ? runStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, runStreak);
    prevKey = key;
  }
  longestStreak = Math.max(longestStreak, streak);

  const dayCounts = new Map<string, number>();
  for (const r of allProgress ?? []) {
    const d = new Date(r.completed_at as string);
    const key = dayKey(d);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const maxLessonsInOneDay =
    dayCounts.size === 0 ? 0 : Math.max(...dayCounts.values());

  // Comments posted by the user (RLS lets them see all on published lessons,
  // but we filter to their own).
  const { count: commentsPosted } = await supabase
    .from("lesson_comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // A&P I scholar: completed every published lesson in the ap1 course.
  const { data: ap1 } = await supabase
    .from("courses")
    .select(
      "id, slug, units(id, lessons(id, published))"
    )
    .eq("slug", "ap1")
    .maybeSingle();
  const ap1Published = ((ap1?.units ?? []) as Array<{
    lessons: Array<{ id: string; published: boolean }>;
  }>).flatMap((u) => (u.lessons ?? []).filter((l) => l.published));
  const doneIdSet = new Set(
    (allProgress ?? []).map((p) => (p as { lesson_id?: string }).lesson_id)
  );
  // The allProgress query above doesn't include lesson_id; pull it for this
  // calculation. Cheap because it's the same table.
  const { data: progressIds } = await supabase
    .from("lesson_progress")
    .select("lesson_id");
  const completedLessonIds = new Set(
    (progressIds ?? []).map((p) => p.lesson_id as string)
  );
  const apOneCompleted =
    ap1Published.length > 0 &&
    ap1Published.every((l) => completedLessonIds.has(l.id));

  const badges = computeBadges({
    totalLessonsDone: totalDone,
    currentStreak: streak,
    longestStreak,
    maxLessonsInOneDay,
    commentsPosted: commentsPosted ?? 0,
    apOneCompleted,
  });
  void doneIdSet; // unused: kept for clarity

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

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Day streak"
          value={streak.toString()}
          accent={streak > 0 ? "fire" : "muted"}
        />
        <Stat label="Lessons completed" value={totalDone.toString()} />
        <Stat label="This week" value={doneThisWeek.toString()} />
      </div>

      {nextUp ? (
        <Link
          href={`/courses/${nextUp.courseSlug}/${nextUp.unitSlug}/${nextUp.lessonSlug}`}
          className="mt-8 block rounded-2xl border border-blue-200 bg-blue-50 p-6 hover:bg-blue-100"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
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
            className="mt-4 inline-block rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Browse courses
          </Link>
        </div>
      )}

      <h2 className="mt-12 text-lg font-semibold">Badges</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {badges.filter((b) => b.earned).length} of {badges.length} earned
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b) => (
          <BadgeCard key={b.id} badge={b} />
        ))}
      </ul>

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

function Stat({
  label,
  value,
  accent = "muted",
}: {
  label: string;
  value: string;
  accent?: "fire" | "muted";
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold ${
          accent === "fire" ? "text-red-600" : "text-neutral-900"
        }`}
      >
        {accent === "fire" && value !== "0" ? `🔥 ${value}` : value}
      </p>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <li
      className={`rounded-2xl border p-4 transition ${
        badge.earned
          ? "border-blue-200 bg-blue-50"
          : "border-neutral-200 bg-white opacity-60"
      }`}
      title={badge.description}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{badge.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">
            {badge.title}
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">{badge.description}</p>
          {badge.progress && !badge.earned && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full bg-blue-700"
                  style={{
                    width: `${Math.round((badge.progress.current / badge.progress.goal) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-neutral-500">
                {badge.progress.current} / {badge.progress.goal}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
