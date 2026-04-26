import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminHelpPage() {
  await requireAdmin("/admin/help");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Welcome to ACE Brain
        </h1>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          &larr; Admin
        </Link>
      </div>
      <p className="mt-3 text-neutral-700">
        Two guides to get you live: how to add a lesson, and how to set up
        weekend tutoring through Cal.com. Open whichever you need.
      </p>

      <details className="mt-8 group rounded-2xl border border-neutral-200 bg-white p-6 open:bg-blue-50 open:border-blue-200">
        <summary className="cursor-pointer text-xl font-semibold tracking-tight">
          How to add a lesson <span className="text-sm font-normal text-neutral-500 ml-2 group-open:hidden">click to open</span>
        </summary>

        <div className="mt-4 space-y-5 text-neutral-800">
          <p>
            Lessons sit inside a unit, and units sit inside a course. The
            two free courses (Anatomy &amp; Physiology I + II) and their
            units are already set up for you. You just need to add lessons.
          </p>

          <ol className="space-y-4 list-decimal pl-5">
            <li>
              <strong>Get the video ready.</strong> Either upload it to
              YouTube as <em>Unlisted</em> (so only people with the link can
              find it) and copy the URL, or post it to your Facebook page as
              a <em>Public</em> video and copy that URL. Both work.
            </li>
            <li>
              Open <Link href="/admin/lessons/new" className="text-blue-700 underline">+ New lesson</Link>.
            </li>
            <li>
              Pick the unit it belongs to. (Example: a lesson on the cell
              membrane goes under <em>Anatomy &amp; Physiology I &middot;
              Cells</em>.)
            </li>
            <li>
              Type a clear title (e.g. <em>The Cell Membrane</em>) and a
              one-sentence description.
            </li>
            <li>
              Set <em>Video source</em> to YouTube or Facebook, paste the
              URL, and write any notes you want students to read alongside
              the video.
            </li>
            <li>
              Tick <strong>Publish immediately</strong> if you want students
              to see it right away. Otherwise leave it unticked &mdash; it
              saves as a draft.
            </li>
            <li>
              Click <strong>Create lesson</strong>. That&apos;s it. The
              lesson now appears on its course page for any student who&apos;s
              signed in.
            </li>
          </ol>

          <p className="rounded-lg bg-white p-4 text-sm">
            <strong>Bonus:</strong> after you publish, anyone who has
            already started that course gets a notification email. So
            students who completed even one lesson in A&amp;P I will hear
            about every new A&amp;P I lesson you add.
          </p>

          <div>
            <p className="font-semibold">Editing or reordering later</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>
                Open <Link href="/admin/lessons" className="text-blue-700 underline">Lessons</Link> &mdash;
                everything is grouped by unit.
              </li>
              <li>
                Use the small ▲ ▼ arrows next to each lesson to reorder
                within a unit.
              </li>
              <li>
                Click a lesson title to edit its content, change the video,
                or unpublish.
              </li>
              <li>
                Click <em>Manage questions</em> on any lesson to add a
                multiple-choice quiz students can use to check themselves.
              </li>
            </ul>
          </div>
        </div>
      </details>

      <details className="mt-6 group rounded-2xl border border-neutral-200 bg-white p-6 open:bg-blue-50 open:border-blue-200">
        <summary className="cursor-pointer text-xl font-semibold tracking-tight">
          How to set up weekend tutoring <span className="text-sm font-normal text-neutral-500 ml-2 group-open:hidden">click to open</span>
        </summary>

        <div className="mt-4 space-y-5 text-neutral-800">
          <p>
            Tutoring runs through <strong>Cal.com</strong>, a free booking
            tool. You connect your Google Calendar so students can&apos;t
            double-book you, and you connect Stripe so they pay before the
            session is confirmed. About 15 minutes of clicking, end to end.
          </p>

          <ol className="space-y-4 list-decimal pl-5">
            <li>
              <strong>Create a free Cal.com account</strong> at{" "}
              <a
                href="https://cal.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                cal.com/signup
              </a>
              . Use the same email students will book under. Pick a username
              like <code className="rounded bg-neutral-100 px-1">peter-quarshie</code>.
            </li>

            <li>
              <strong>Connect your Google Calendar</strong>: Settings &rarr;
              Apps &rarr; Google Calendar &rarr; Install. This makes sure
              Cal.com knows when you&apos;re busy.
            </li>

            <li>
              <strong>Connect Stripe</strong> so students pay when they
              book: Settings &rarr; Apps &rarr; Stripe &rarr; Install. If
              you don&apos;t have a Stripe account yet, it walks you
              through creating one.
            </li>

            <li>
              <strong>Create the event type</strong>: Event Types &rarr;
              <em>+ New</em>. Set:
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>Title: <em>Weekend Tutoring</em></li>
                <li>URL slug: <code className="rounded bg-neutral-100 px-1">weekend-tutoring</code></li>
                <li>Duration: <strong>60 minutes</strong></li>
                <li>Location: <em>Google Meet</em> (free, auto-generated link per booking)</li>
                <li>
                  Availability: weekends only. Click into the event &rarr;
                  Availability tab &rarr; create a new schedule with
                  Saturday + Sunday hours, untick the weekdays.
                </li>
                <li>
                  Payments: enable Stripe, set <strong>$200</strong>. (See
                  the note below for the first-session intro rate.)
                </li>
              </ul>
            </li>

            <li>
              <strong>For the $100 first-session offer:</strong> create a
              second event type called <em>First Session (50% off)</em>
              with slug <code className="rounded bg-neutral-100 px-1">first-session</code>,
              same 60 minutes, $100 price. Mention in the description that
              it&apos;s one-time per student.
            </li>

            <li>
              <strong>Tell ACE Brain about your Cal account.</strong> Daniel
              needs to add two values to Vercel:
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>
                  <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_CAL_USERNAME</code> &rarr; your Cal username (e.g. <code className="rounded bg-neutral-100 px-1">peter-quarshie</code>)
                </li>
                <li>
                  <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_CAL_EVENT_SLUG</code> &rarr; <code className="rounded bg-neutral-100 px-1">weekend-tutoring</code>
                </li>
              </ul>
              Once he adds those and redeploys, the booking calendar
              appears on the <Link href="/tutoring" className="text-blue-700 underline">/tutoring</Link> page in
              place of the &ldquo;Booking opens soon&rdquo; placeholder.
            </li>

            <li>
              <strong>Set up the webhook</strong> so bookings show up in
              your admin dashboard automatically:
              <ul className="mt-2 space-y-1 list-disc pl-5">
                <li>Cal.com &rarr; Settings &rarr; Developer &rarr; Webhooks &rarr; New Webhook</li>
                <li>
                  Subscriber URL: <code className="rounded bg-neutral-100 px-1 text-xs">https://ace-brain-seven.vercel.app/api/webhooks/cal</code>
                </li>
                <li>
                  Subscribe to: <em>Booking Created</em>, <em>Booking
                    Rescheduled</em>, <em>Booking Cancelled</em>
                </li>
                <li>Save.</li>
              </ul>
              Bookings now appear in real time at{" "}
              <Link href="/admin/bookings" className="text-blue-700 underline">/admin/bookings</Link>
              {" "}and students get a branded ACE Brain confirmation email.
            </li>
          </ol>

          <p className="rounded-lg bg-white p-4 text-sm">
            <strong>If anything goes sideways</strong>, message Daniel.
            Cal.com&apos;s setup pages move around occasionally; he can
            screenshare and walk you through any step.
          </p>
        </div>
      </details>

      <details className="mt-6 group rounded-2xl border border-neutral-200 bg-white p-6 open:bg-blue-50 open:border-blue-200">
        <summary className="cursor-pointer text-xl font-semibold tracking-tight">
          Other things worth knowing <span className="text-sm font-normal text-neutral-500 ml-2 group-open:hidden">click to open</span>
        </summary>

        <div className="mt-4 space-y-3 text-neutral-800">
          <p>
            <strong>Discussions:</strong> every lesson has a comment box at
            the bottom. Students can ask questions; you can pin great
            answers (yours or theirs) so they sit at the top.
          </p>
          <p>
            <strong>Quizzes:</strong> 4-choice multiple choice with an
            explanation. Students get instant green/red feedback after each
            try. Use them to make sure the lesson stuck.
          </p>
          <p>
            <strong>Drafts:</strong> a lesson with the &ldquo;Published&rdquo;
            box unticked is invisible to students. Use this to work on
            a lesson over a few sessions without anyone seeing the half-
            finished version.
          </p>
          <p>
            <strong>Course visibility:</strong> A&amp;P II is currently a
            draft course. Toggle it published from{" "}
            <Link href="/admin/courses" className="text-blue-700 underline">Courses</Link>{" "}
            when you&apos;re ready.
          </p>
        </div>
      </details>
    </div>
  );
}
