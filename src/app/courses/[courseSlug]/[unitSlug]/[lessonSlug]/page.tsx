import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoEmbed } from "@/components/VideoEmbed";
import { MarkComplete } from "@/components/MarkComplete";
import { Quiz, type QuizQuestion } from "@/components/Quiz";
import { Discussion } from "@/components/Discussion";
import type { Lesson } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; unitSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, unitSlug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "*, units!inner(slug, courses!inner(slug, title))"
    )
    .eq("slug", lessonSlug)
    .eq("units.slug", unitSlug)
    .eq("units.courses.slug", courseSlug)
    .eq("published", true)
    .maybeSingle();

  if (!lesson) notFound();

  type Joined = Lesson & {
    units:
      | { courses: { slug: string; title: string } | { slug: string; title: string }[] }
      | { courses: { slug: string; title: string } | { slug: string; title: string }[] }[];
  };
  const joined = lesson as Joined;
  const unit = Array.isArray(joined.units) ? joined.units[0] : joined.units;
  const course = Array.isArray(unit.courses) ? unit.courses[0] : unit.courses;
  const l = joined;

  const { data: questionRows } = await supabase
    .from("quiz_questions")
    .select(
      "id, prompt, explanation, position, question_type, answer_key, quiz_choices(id, body, is_correct, position)"
    )
    .eq("lesson_id", l.id)
    .order("position", { ascending: true });

  const questions: QuizQuestion[] = (questionRows ?? []).map((q) => ({
    id: q.id as string,
    prompt: q.prompt as string,
    explanation: (q.explanation as string | null) ?? null,
    question_type:
      ((q.question_type as string) ?? "multiple_choice") as
        | "multiple_choice"
        | "short_answer",
    answer_key: (q.answer_key as string | null) ?? null,
    choices: ((q.quiz_choices ?? []) as Array<{
      id: string;
      body: string;
      is_correct: boolean;
      position: number;
    }>)
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, body: c.body, is_correct: c.is_correct })),
  }));

  // Find the next published lesson in this course (next in unit, or first
  // of the next unit). Used for the "Next lesson" link at the bottom.
  const { data: courseFull } = await supabase
    .from("courses")
    .select(
      "slug, units(slug, position, lessons(slug, title, position, published))"
    )
    .eq("slug", course.slug)
    .maybeSingle();

  const orderedLessons: Array<{
    unitSlug: string;
    lessonSlug: string;
    title: string;
  }> = ((courseFull?.units ?? []) as Array<{
    slug: string;
    position: number;
    lessons: Array<{ slug: string; title: string; position: number; published: boolean }>;
  }>)
    .sort((a, b) => a.position - b.position)
    .flatMap((u) =>
      (u.lessons ?? [])
        .filter((x) => x.published)
        .sort((a, b) => a.position - b.position)
        .map((x) => ({
          unitSlug: u.slug,
          lessonSlug: x.slug,
          title: x.title,
        }))
    );

  const currentIdx = orderedLessons.findIndex(
    (x) => x.unitSlug === unitSlug && x.lessonSlug === lessonSlug
  );
  const nextLesson =
    currentIdx >= 0 && currentIdx < orderedLessons.length - 1
      ? orderedLessons[currentIdx + 1]
      : null;
  const prevLesson =
    currentIdx > 0 ? orderedLessons[currentIdx - 1] : null;

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/courses/${course.slug}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        &larr; {course.title}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{l.title}</h1>
      {l.description && (
        <p className="mt-2 text-neutral-600">{l.description}</p>
      )}

      <div className="mt-8">
        <VideoEmbed source={l.video_source} url={l.video_url} title={l.title} />
      </div>

      <div className="mt-6">
        <MarkComplete lessonId={l.id} />
      </div>

      {l.notes_html && (
        <div
          className="prose prose-neutral mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: l.notes_html }}
        />
      )}

      <Quiz questions={questions} />

      <nav className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        {prevLesson ? (
          <Link
            href={`/courses/${course.slug}/${prevLesson.unitSlug}/${prevLesson.lessonSlug}`}
            className="flex-1 rounded-2xl border border-neutral-200 p-4 hover:border-neutral-400"
          >
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              &larr; Previous
            </p>
            <p className="mt-1 font-medium">{prevLesson.title}</p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextLesson ? (
          <Link
            href={`/courses/${course.slug}/${nextLesson.unitSlug}/${nextLesson.lessonSlug}`}
            className="flex-1 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-right hover:bg-blue-100"
          >
            <p className="text-xs uppercase tracking-widest text-blue-700">
              Next &rarr;
            </p>
            <p className="mt-1 font-medium">{nextLesson.title}</p>
          </Link>
        ) : (
          <Link
            href={`/courses/${course.slug}`}
            className="flex-1 rounded-2xl border border-neutral-200 p-4 text-right hover:bg-neutral-50"
          >
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Course complete
            </p>
            <p className="mt-1 font-medium">Back to {course.title}</p>
          </Link>
        )}
      </nav>

      <Discussion lessonId={l.id} />
    </article>
  );
}
