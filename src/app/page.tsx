import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero: cream/parchment panel echoing the book cover */}
      <section className="bg-[#f5ede0]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-red-600">
              Stop memorizing. Start mapping.
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-[#7a1f22]">
              Master Anatomy &amp; Physiology
              <br />
              the way your brain learns.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-700">
              A visual learning system from Dr. Peter Amua-Quarshie, anatomy
              educator and author of{" "}
              <em>Illustrated Mind Mapping for Anatomy &amp; Physiology</em>.
              Watch lessons, build mind maps, and book 1-on-1 weekend tutoring.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="rounded-full bg-blue-700 px-6 py-3 text-white font-medium hover:bg-blue-800 text-center"
              >
                Browse free lessons
              </Link>
              <Link
                href="/tutoring"
                className="rounded-full border-2 border-blue-700 text-blue-700 px-6 py-3 font-medium hover:bg-blue-50 text-center"
              >
                Book tutoring · $100 first session
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Link
              href="/book"
              className="block max-w-xs transition hover:scale-[1.02]"
              aria-label="View the book"
            >
              <Image
                src="/brand/book-cover.jpg"
                alt="Illustrated Mind Mapping for Anatomy & Physiology book cover"
                width={500}
                height={750}
                className="rounded-lg shadow-2xl"
                priority
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Three-up feature row */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
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
              body: "Weekend tutoring sessions, $200 each ($100 your first time). Personalized guidance through tough topics.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-neutral-200 p-6"
            >
              <h3 className="font-semibold text-blue-700">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet your instructor */}
      <section className="bg-neutral-50">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-[auto_1fr]">
          <Image
            src="/brand/peter.jpg"
            alt="Dr. Peter Amua-Quarshie"
            width={240}
            height={240}
            className="h-48 w-48 rounded-full object-cover shadow-lg ring-4 ring-white"
          />
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-red-600">
              Meet your instructor
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-700">
              Dr. Peter Amua-Quarshie, MD, MPH, MS
            </h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">
              Anatomy &amp; physiology educator and physician. Peter has spent
              years helping pre-med, medical, and nursing students see beyond
              the textbook, turning dense material into structured, memorable
              visual maps. ACE Brain is the home for his lessons, his book, and
              his weekend tutoring.
            </p>
            <Link
              href="/tutoring"
              className="mt-6 inline-block rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Book a session with Peter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
