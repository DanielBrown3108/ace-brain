import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function createUnit(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const course_id = String(formData.get("course_id") ?? "");
  const courseSlug = String(formData.get("course_slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const position = Number(formData.get("position") ?? 0) || 0;

  const { error } = await supabase
    .from("units")
    .insert({ course_id, title, slug, position });
  if (error) throw new Error(error.message);
  revalidatePath(`/courses/${courseSlug}`);
  redirect(`/admin/courses/${courseSlug}`);
}

export default async function AdminCourseDetail({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const { supabase } = await requireAdmin(`/admin/courses/${courseSlug}`);

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, slug, title, position")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin/courses"
        className="text-sm text-neutral-500 hover:underline"
      >
        &larr; All courses
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{course.title}</h1>
      <p className="text-sm text-neutral-500">/{course.slug}</p>

      <h2 className="mt-10 text-lg font-semibold">Units</h2>
      <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {units?.length === 0 && (
          <li className="px-4 py-3 text-sm text-neutral-500">No units yet.</li>
        )}
        {units?.map((u) => (
          <li key={u.id} className="px-4 py-3">
            <p className="font-medium">{u.title}</p>
            <p className="text-xs text-neutral-500">
              /{u.slug} · position {u.position}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-base font-semibold">Add a unit</h3>
      <form action={createUnit} className="mt-3 space-y-3">
        <input type="hidden" name="course_id" value={course.id} />
        <input type="hidden" name="course_slug" value={course.slug} />
        <input
          name="title"
          required
          placeholder="Title"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <div className="flex gap-3">
          <input
            name="slug"
            placeholder="Slug (optional)"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
          />
          <input
            name="position"
            type="number"
            min={0}
            defaultValue={(units?.length ?? 0) + 1}
            className="w-24 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800"
        >
          Add unit
        </button>
      </form>
    </div>
  );
}
