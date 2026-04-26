import Image from "next/image";
import Link from "next/link";

export default function BookPage() {
  return (
    <div className="bg-[#f5ede0]">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-20 md:grid-cols-[auto_1fr]">
        <Image
          src="/brand/book-cover.jpg"
          alt="Illustrated Mind Mapping for Anatomy & Physiology book cover"
          width={500}
          height={750}
          className="w-full max-w-sm rounded-lg shadow-2xl md:w-80"
          priority
        />

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-red-600">
            #1 New Release in Physiology
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#7a1f22]">
            Illustrated Mind Mapping for Anatomy &amp; Physiology
          </h1>
          <p className="mt-2 text-neutral-700">
            By Dr. Peter Amua-Quarshie, MD, MPH, MS
          </p>

          <div className="mt-8 space-y-4 text-neutral-800 leading-relaxed">
            <p>
              A complete visual learning system designed to help you see,
              connect, and retain anatomy and physiology like never before.
              Built on mind-mapping and visual cognition, this book transforms
              dense content into clear, structured, memorable diagrams.
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
              className="rounded-full bg-blue-700 px-6 py-3 text-white font-medium hover:bg-blue-800 text-center"
            >
              Get the book on Amazon
            </a>
            <Link
              href="/courses"
              className="rounded-full border-2 border-blue-700 text-blue-700 px-6 py-3 font-medium hover:bg-blue-50 text-center"
            >
              Start the free course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
