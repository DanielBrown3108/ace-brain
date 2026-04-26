import Image from "next/image";
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
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <p className="mt-2 text-neutral-600">
        Free, structured A&amp;P content built around mind-mapping.
      </p>

      {courses && courses.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {(courses as Course[]).map((c) => (
            <li key={c.id}>
              <Link
                href={`/courses/${c.slug}`}
                className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="aspect-video w-full overflow-hidden bg-[#f5ede0]">
                  {c.cover_image_url ? (
                    <Image
                      src={c.cover_image_url}
                      alt=""
                      width={1200}
                      height={675}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[#7a1f22]">
                      <span className="font-semibold tracking-wide">
                        {c.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-blue-700">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="mt-2 text-sm text-neutral-600">
                      {c.description}
                    </p>
                  )}
                </div>
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
