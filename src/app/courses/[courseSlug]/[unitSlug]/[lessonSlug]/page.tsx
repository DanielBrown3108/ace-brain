import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoEmbed } from "@/components/VideoEmbed";
import { MarkComplete } from "@/components/MarkComplete";
import { Quiz, type QuizQuestion } from "@/components/Quiz";
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
    .select("id, prompt, explanation, position, quiz_choices(id, body, is_correct, position)")
    .eq("lesson_id", l.id)
    .order("position", { ascending: true });

  const questions: QuizQuestion[] = (questionRows ?? []).map((q) => ({
    id: q.id as string,
    prompt: q.prompt as string,
    explanation: (q.explanation as string | null) ?? null,
    choices: ((q.quiz_choices ?? []) as Array<{
      id: string;
      body: string;
      is_correct: boolean;
      position: number;
    }>)
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, body: c.body, is_correct: c.is_correct })),
  }));

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
    </article>
  );
}
