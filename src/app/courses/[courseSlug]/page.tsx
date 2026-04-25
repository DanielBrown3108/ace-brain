import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("published", true)
    .maybeSingle();

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, slug, title, position, lessons(id, slug, title, position, published)")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/courses" className="text-sm text-neutral-500 hover:underline">
        &larr; All courses
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{course.title}</h1>
      {course.description && (
        <p className="mt-2 text-neutral-600">{course.description}</p>
      )}

      <div className="mt-10 space-y-8">
        {units?.map((u) => {
          const lessons = (u.lessons ?? [])
            .filter((l) => l.published)
            .sort((a, b) => a.position - b.position);
          return (
            <section key={u.id}>
              <h2 className="text-lg font-semibold">{u.title}</h2>
              <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                {lessons.length === 0 && (
                  <li className="px-4 py-3 text-sm text-neutral-500">
                    No lessons published yet.
                  </li>
                )}
                {lessons.map((l, i) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${course.slug}/${u.slug}/${l.slug}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
                    >
                      <span>
                        <span className="text-sm text-neutral-400 mr-3">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {l.title}
                      </span>
                      <span className="text-sm text-neutral-400">Watch &rarr;</span>
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
