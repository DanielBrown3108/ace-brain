import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "ACE Brain is Dr. Peter Amua-Quarshie's home for visual anatomy & physiology learning. Free lessons built around mind mapping, weekend 1-on-1 tutoring, and the companion book Illustrated Mind Mapping for A&P.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#f5ede0]">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-red-600">
            About
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#7a1f22]">
            Anatomy &amp; physiology, the way your brain learns.
          </h1>
          <p className="mt-6 text-lg text-neutral-700">
            ACE Brain is a free, visual, mind-map-driven companion for
            students slogging through anatomy and physiology. Built by
            Dr. Peter Amua-Quarshie around the pedagogy in his book{" "}
            <em>Illustrated Mind Mapping for Anatomy &amp; Physiology</em>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-blue-700">
          Why mind mapping
        </h2>
        <div className="mt-4 space-y-4 text-neutral-800 leading-relaxed">
          <p>
            A&amp;P is dense. The textbooks are huge. The diagrams are static.
            Most students try to brute-force it with flashcards and rewriting
            notes, then forget half of it before the next exam.
          </p>
          <p>
            Mind mapping flips that. Instead of a flat list of facts, you
            organize each topic the way the brain actually stores it:
            central concept in the middle, branches radiating out to
            structures, functions, and relationships. You see the system
            instead of memorizing its parts.
          </p>
          <p>
            Every lesson on this site uses that same structure: a short
            video, written notes that map the territory, and a quick
            multiple-choice check to make sure the shape stuck.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-[auto_1fr]">
          <Image
            src="/brand/peter.jpg"
            alt="Dr. Peter Amua-Quarshie"
            width={240}
            height={240}
            className="h-40 w-40 rounded-full object-cover shadow-lg ring-4 ring-white sm:h-56 sm:w-56"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-blue-700">
              Dr. Peter Amua-Quarshie, MD, MPH, MS
            </h2>
            <p className="mt-3 text-neutral-800 leading-relaxed">
              Physician, anatomy educator, and the author of{" "}
              <em>Illustrated Mind Mapping for Anatomy &amp; Physiology</em>.
              Peter has spent years teaching pre-med, medical, nursing, and
              allied-health students &mdash; and watching them struggle
              with the same wall of dense textbook prose. ACE Brain is his
              answer to that wall.
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

      <section className="bg-[#f5ede0]">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-red-600">
              The book
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#7a1f22]">
              Illustrated Mind Mapping for Anatomy &amp; Physiology
            </h2>
            <p className="mt-3 text-neutral-800 leading-relaxed">
              The print companion to this site. 185 pages of visual maps
              covering every system in A&amp;P I &amp; II. Use it alongside
              the free lessons here, or on its own.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.amazon.com/dp/B0GX2TLFGL"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-blue-700 px-5 py-2 text-center font-medium text-white hover:bg-blue-800"
              >
                Get the book on Amazon
              </a>
              <Link
                href="/book"
                className="rounded-full border-2 border-blue-700 text-blue-700 px-5 py-2 text-center font-medium hover:bg-blue-50"
              >
                Read more
              </Link>
            </div>
          </div>
          <Image
            src="/brand/book-cover.jpg"
            alt="Illustrated Mind Mapping for Anatomy & Physiology book cover"
            width={500}
            height={750}
            className="w-48 rounded-lg shadow-2xl md:w-64 mx-auto md:mx-0"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-blue-700">
          How ACE Brain works
        </h2>
        <ul className="mt-4 space-y-3 text-neutral-800 leading-relaxed">
          <li>
            <strong>Free lessons.</strong> Browse the catalog, watch a
            lesson, mark it complete, take the quick quiz. No paywall.
          </li>
          <li>
            <strong>Discussions.</strong> Every lesson has a comment thread
            for questions and notes. Peter pins the best answers.
          </li>
          <li>
            <strong>Weekend 1-on-1 tutoring.</strong> When you want
            personal help with a specific topic or exam, book a session
            with Peter. $200 per session, $100 for your first.
          </li>
          <li>
            <strong>The book.</strong> The full visual system in printed
            form, designed to live on your desk while you study.
          </li>
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/courses"
            className="rounded-full bg-blue-700 px-6 py-3 text-center font-medium text-white hover:bg-blue-800"
          >
            Browse free lessons
          </Link>
          <Link
            href="/tutoring"
            className="rounded-full border-2 border-blue-700 text-blue-700 px-6 py-3 text-center font-medium hover:bg-blue-50"
          >
            Book tutoring
          </Link>
        </div>
      </section>
    </>
  );
}
