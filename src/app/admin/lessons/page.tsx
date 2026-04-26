import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function moveLesson(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin("/admin/lessons");
  const lessonId = String(formData.get("lesson_id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, unit_id, position")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return;

  // Find the lesson immediately before/after this one in the same unit.
  const { data: neighbor } = await supabase
    .from("lessons")
    .select("id, position")
    .eq("unit_id", lesson.unit_id)
    .order("position", { ascending: direction === "down" })
    .limit(50);

  // Walk through the ordered list to find the swap target.
  const list = neighbor ?? [];
  const idx = list.findIndex((l) => l.id === lesson.id);
  const target = idx >= 0 ? list[idx + 1] : null;
  if (!target) return;

  // Swap positions with the target.
  await supabase
    .from("lessons")
    .update({ position: target.position })
    .eq("id", lesson.id);
  await supabase
    .from("lessons")
    .update({ position: lesson.position })
    .eq("id", target.id);

  revalidatePath("/admin/lessons");
  revalidatePath("/courses");
}

export default async function AllLessonsPage() {
  const { supabase } = await requireAdmin("/admin/lessons");

  // Group lessons by unit so reordering makes sense.
  const { data: units } = await supabase
    .from("units")
    .select(
      "id, title, position, courses(slug, title), lessons(id, slug, title, position, published, video_source)"
    )
    .order("position", { ascending: true });

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

      <div className="mt-8 space-y-8">
        {units?.length === 0 && (
          <p className="text-sm text-neutral-500">No units yet.</p>
        )}
        {units?.map((u) => {
          const course = Array.isArray(u.courses) ? u.courses[0] : u.courses;
          const lessons = ((u.lessons ?? []) as Array<{
            id: string;
            slug: string;
            title: string;
            position: number;
            published: boolean;
            video_source: string;
          }>).sort((a, b) => a.position - b.position);

          return (
            <section key={u.id}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500">
                {(course as { title: string } | null)?.title} · {u.title}
              </h2>
              <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                {lessons.length === 0 && (
                  <li className="px-4 py-3 text-sm text-neutral-500">
                    No lessons in this unit.
                  </li>
                )}
                {lessons.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-2 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <form action={moveLesson}>
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="flex h-5 w-5 items-center justify-center rounded text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                          aria-label="Move up"
                          title="Move up"
                        >
                          ▲
                        </button>
                      </form>
                      <form action={moveLesson}>
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === lessons.length - 1}
                          className="flex h-5 w-5 items-center justify-center rounded text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                          aria-label="Move down"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </form>
                    </div>
                    <Link
                      href={`/admin/lessons/${l.id}`}
                      className="flex flex-1 items-center justify-between hover:underline"
                    >
                      <div>
                        <p className="font-medium">{l.title}</p>
                        <p className="text-xs text-neutral-500">
                          /{l.slug} · {l.video_source}
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
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
