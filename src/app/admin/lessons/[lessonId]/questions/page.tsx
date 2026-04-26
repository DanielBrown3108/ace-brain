import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function createQuestion(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const lesson_id = String(formData.get("lesson_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim() || null;
  const correctIdx = Number(formData.get("correct") ?? 1);
  const choices = [1, 2, 3, 4]
    .map((i) => String(formData.get(`choice_${i}`) ?? "").trim())
    .filter(Boolean);

  if (!prompt || choices.length < 2) {
    throw new Error("Need a prompt and at least 2 choices.");
  }

  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", lesson_id);

  const { data: q, error } = await supabase
    .from("quiz_questions")
    .insert({
      lesson_id,
      prompt,
      explanation,
      position: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error || !q) throw new Error(error?.message ?? "Failed to create question.");

  const choiceRows = choices.map((body, i) => ({
    question_id: q.id,
    body,
    position: i + 1,
    is_correct: i + 1 === correctIdx,
  }));
  const { error: cErr } = await supabase.from("quiz_choices").insert(choiceRows);
  if (cErr) throw new Error(cErr.message);

  revalidatePath(`/admin/lessons/${lesson_id}/questions`);
  redirect(`/admin/lessons/${lesson_id}/questions`);
}

async function deleteQuestion(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const lesson_id = String(formData.get("lesson_id") ?? "");
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/lessons/${lesson_id}/questions`);
  redirect(`/admin/lessons/${lesson_id}/questions`);
}

export default async function LessonQuestionsPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const { supabase } = await requireAdmin(`/admin/lessons/${lessonId}/questions`);

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, prompt, explanation, position, quiz_choices(id, body, is_correct, position)")
    .eq("lesson_id", lesson.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/admin/lessons/${lesson.id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        &larr; Edit lesson
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Questions for &ldquo;{lesson.title}&rdquo;
      </h1>

      <ul className="mt-8 space-y-4">
        {questions?.length === 0 && (
          <li className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
            No questions yet.
          </li>
        )}
        {questions?.map((q) => {
          const choices = ((q.quiz_choices ?? []) as Array<{
            id: string;
            body: string;
            is_correct: boolean;
            position: number;
          }>).sort((a, b) => a.position - b.position);
          return (
            <li
              key={q.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <p className="font-medium">{q.prompt}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {choices.map((c, i) => (
                  <li
                    key={c.id}
                    className={
                      c.is_correct
                        ? "text-blue-700 font-medium"
                        : "text-neutral-700"
                    }
                  >
                    {String.fromCharCode(65 + i)}. {c.body}
                    {c.is_correct && " ✓"}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="mt-3 text-xs text-neutral-500">
                  <span className="font-medium">Why: </span>
                  {q.explanation as string}
                </p>
              )}
              <form action={deleteQuestion} className="mt-3">
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 text-lg font-semibold">Add a question</h2>
      <form action={createQuestion} className="mt-4 space-y-4">
        <input type="hidden" name="lesson_id" value={lesson.id} />

        <Field label="Question prompt">
          <textarea
            name="prompt"
            required
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Choices (mark the correct one)
          </legend>
          {[1, 2, 3, 4].map((i) => (
            <label key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct"
                value={i}
                defaultChecked={i === 1}
                className="accent-blue-700"
              />
              <input
                name={`choice_${i}`}
                placeholder={`Choice ${String.fromCharCode(64 + i)}`}
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
              />
            </label>
          ))}
        </fieldset>

        <Field label="Explanation (shown after the student answers)">
          <textarea
            name="explanation"
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <button
          type="submit"
          className="rounded-full bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800"
        >
          Add question
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
