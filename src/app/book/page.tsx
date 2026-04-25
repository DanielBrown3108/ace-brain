import Link from "next/link";

export default function BookPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-emerald-700">
        #1 New Release in Physiology
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Illustrated Mind Mapping for Anatomy &amp; Physiology
      </h1>
      <p className="mt-2 text-neutral-500">By Dr. Peter Quarshie</p>

      <div className="mt-8 space-y-4 text-neutral-700 leading-relaxed">
        <p>
          A complete visual learning system designed to help you see, connect,
          and retain anatomy and physiology like never before. Built on
          mind-mapping and visual cognition, this book transforms dense content
          into clear, structured, memorable diagrams.
        </p>
        <p>
          Especially powerful for pre-med and medical students, nursing and
          allied-health students, A&amp;P I &amp; II coursework, and visual
          learners who struggle with traditional textbooks.
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="https://www.amazon.com/dp/B0GX2TLFGL"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-700 px-6 py-3 text-white font-medium hover:bg-emerald-800 text-center"
        >
          Get the book on Amazon
        </a>
        <Link
          href="/courses"
          className="rounded-full border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-50 text-center"
        >
          Start the free course
        </Link>
      </div>
    </div>
  );
}
