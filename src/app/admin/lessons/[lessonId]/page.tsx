import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify, resolveFacebookShareUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function updateLesson(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const unit_id = String(formData.get("unit_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(title);
  const description = String(formData.get("description") ?? "").trim() || null;
  const video_source = String(formData.get("video_source") ?? "youtube") as
    | "youtube"
    | "facebook"
    | "none";
  let video_url = String(formData.get("video_url") ?? "").trim() || null;
  if (video_source === "facebook" && video_url) {
    video_url = await resolveFacebookShareUrl(video_url);
  }
  const notes_html = String(formData.get("notes_html") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const position = Number(formData.get("position") ?? 0) || 0;

  const { error } = await supabase
    .from("lessons")
    .update({
      unit_id,
      title,
      slug,
      description,
      video_source,
      video_url,
      notes_html,
      published,
      position,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/courses");
  redirect("/admin/lessons");
}

async function deleteLesson(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/courses");
  redirect("/admin/lessons");
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const { supabase } = await requireAdmin(`/admin/lessons/${lessonId}`);

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, title, courses(title)")
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin/lessons"
        className="text-sm text-neutral-500 hover:underline"
      >
        &larr; All lessons
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit lesson</h1>
        <Link
          href={`/admin/lessons/${lesson.id}/questions`}
          className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-50"
        >
          Manage questions &rarr;
        </Link>
      </div>

      <form action={updateLesson} className="mt-8 space-y-5">
        <input type="hidden" name="id" value={lesson.id} />

        <Field label="Unit">
          <select
            name="unit_id"
            required
            defaultValue={lesson.unit_id}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            {units?.map((u) => {
              const c = Array.isArray(u.courses) ? u.courses[0] : u.courses;
              return (
                <option key={u.id} value={u.id}>
                  {(c as { title: string } | null)?.title} — {u.title}
                </option>
              );
            })}
          </select>
        </Field>

        <Field label="Title">
          <input
            name="title"
            required
            defaultValue={lesson.title}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Slug">
          <input
            name="slug"
            defaultValue={lesson.slug}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={2}
            defaultValue={lesson.description ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Video source">
          <select
            name="video_source"
            defaultValue={lesson.video_source}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="none">No video</option>
          </select>
        </Field>

        <Field label="Video URL">
          <input
            name="video_url"
            defaultValue={lesson.video_url ?? ""}
            placeholder="https://youtu.be/... or https://www.facebook.com/..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Notes (HTML allowed)">
          <textarea
            name="notes_html"
            rows={6}
            defaultValue={lesson.notes_html ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
          />
        </Field>

        <Field label="Position">
          <input
            type="number"
            name="position"
            defaultValue={lesson.position}
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={lesson.published}
          />
          Published
        </label>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="rounded-full bg-blue-700 px-6 py-2.5 font-medium text-white hover:bg-blue-800"
          >
            Save changes
          </button>
        </div>
      </form>

      <hr className="my-12 border-neutral-200" />

      <details className="rounded-xl border border-red-200 bg-red-50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-red-800">
          Danger zone — delete this lesson
        </summary>
        <p className="mt-2 text-sm text-red-700">
          Deleting this lesson also removes all student progress rows for it.
          This cannot be undone.
        </p>
        <form action={deleteLesson} className="mt-4">
          <input type="hidden" name="id" value={lesson.id} />
          <button
            type="submit"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete &ldquo;{lesson.title}&rdquo;
          </button>
        </form>
      </details>
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
