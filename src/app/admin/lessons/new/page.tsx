import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveFacebookShareUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/lessons/new");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/admin");
  return supabase;
}

async function createLesson(formData: FormData) {
  "use server";
  const supabase = await requireAdmin();

  const unit_id = String(formData.get("unit_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

  const { error } = await supabase.from("lessons").insert({
    unit_id,
    slug,
    title,
    description,
    video_source,
    video_url,
    notes_html,
    published,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/courses");
  redirect("/admin/lessons");
}

export default async function NewLessonPage() {
  const supabase = await requireAdmin();
  const { data: units } = await supabase
    .from("units")
    .select("id, title, courses(title)")
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">New lesson</h1>

      <form action={createLesson} className="mt-8 space-y-5">
        <Field label="Unit">
          <select
            name="unit_id"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="">Select a unit…</option>
            {units?.map((u) => {
              const course = Array.isArray(u.courses) ? u.courses[0] : u.courses;
              return (
                <option key={u.id} value={u.id}>
                  {(course as { title: string } | null)?.title} — {u.title}
                </option>
              );
            })}
          </select>
        </Field>

        <Field label="Title">
          <input
            name="title"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Slug (optional, auto-generated from title)">
          <input
            name="slug"
            placeholder="e.g. cell-membrane"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Video source">
          <select
            name="video_source"
            defaultValue="youtube"
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
            placeholder="https://youtu.be/... or https://www.facebook.com/..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>

        <Field label="Notes (HTML allowed)">
          <textarea
            name="notes_html"
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Publish immediately
        </label>

        <button
          type="submit"
          className="rounded-full bg-emerald-700 px-6 py-2.5 font-medium text-white hover:bg-emerald-800"
        >
          Create lesson
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
