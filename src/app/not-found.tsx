import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-blue-700">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-neutral-600">
        That lesson, course, or page doesn&apos;t exist. It might be in draft,
        moved, or gone.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/courses"
          className="rounded-full bg-blue-700 px-5 py-2.5 font-medium text-white hover:bg-blue-800"
        >
          Browse courses
        </Link>
        <Link
          href="/"
          className="rounded-full border border-neutral-300 px-5 py-2.5 font-medium hover:bg-neutral-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
