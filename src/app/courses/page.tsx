import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="mt-4 text-red-600">
          Couldn&apos;t load courses. Make sure the Supabase env vars are set
          and the schema has been applied.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <p className="mt-2 text-neutral-600">
        Free, structured A&amp;P content built around mind-mapping.
      </p>

      {courses && courses.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {(courses as Course[]).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400"
            >
              <Link href={`/courses/${c.slug}`} className="block">
                <h2 className="text-xl font-semibold">{c.title}</h2>
                {c.description && (
                  <p className="mt-2 text-sm text-neutral-600">
                    {c.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-neutral-500">
          No courses published yet. Check back soon.
        </p>
      )}
    </div>
  );
}
