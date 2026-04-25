import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-700">
          Stop memorizing. Start mapping.
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight">
          Master Anatomy &amp; Physiology
          <br />
          the way your brain learns.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
          A visual learning system from Dr. Peter Quarshie, anatomy educator and
          author of <em>Illustrated Mind Mapping for Anatomy &amp; Physiology</em>.
          Watch lessons, build mind maps, and book 1-on-1 weekend tutoring.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/courses"
            className="rounded-full bg-emerald-700 px-6 py-3 text-white font-medium hover:bg-emerald-800"
          >
            Browse free lessons
          </Link>
          <Link
            href="/tutoring"
            className="rounded-full border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-50"
          >
            Book weekend tutoring
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-8 sm:grid-cols-3">
        {[
          {
            title: "Visual mind maps",
            body: "Right-branching diagrams that mirror how the brain organizes information.",
          },
          {
            title: "Built for pre-med & nursing",
            body: "A&P I & II coverage from cells and tissues to every organ system.",
          },
          {
            title: "1-on-1 with Dr. Quarshie",
            body: "Weekend tutoring sessions for personalized guidance through tough topics.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-neutral-200 p-6"
          >
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
