import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function createCourse(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin("/admin/courses");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const published = formData.get("published") === "on";

  const { error } = await supabase
    .from("courses")
    .insert({ title, description, slug, published });
  if (error) throw new Error(error.message);
  revalidatePath("/courses");
  redirect("/admin/courses");
}

async function togglePublish(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin("/admin/courses");
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  const { error } = await supabase
    .from("courses")
    .update({ published: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
}

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin("/admin/courses");
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, published, position")
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          &larr; Admin
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {courses?.length === 0 && (
          <li className="px-4 py-3 text-sm text-neutral-500">
            No courses yet. Add one below.
          </li>
        )}
        {courses?.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <Link
              href={`/admin/courses/${c.slug}`}
              className="flex-1 hover:underline"
            >
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-neutral-500">/{c.slug}</p>
            </Link>
            <form action={togglePublish}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="next" value={String(!c.published)} />
              <button
                type="submit"
                className={`rounded-full px-3 py-1 text-xs ${
                  c.published
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {c.published ? "Published" : "Draft"}
              </button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-lg font-semibold">Add a course</h2>
      <form action={createCourse} className="mt-4 space-y-4">
        <input
          name="title"
          required
          placeholder="Title"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <input
          name="slug"
          placeholder="Slug (optional)"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Description"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Publish immediately
        </label>
        <button
          type="submit"
          className="rounded-full bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800"
        >
          Create course
        </button>
      </form>
    </div>
  );
}
