const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME;
const CAL_EVENT = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG;
const CAL_CONFIGURED = Boolean(CAL_USERNAME && CAL_EVENT);

export default function TutoringPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-blue-700">
        Weekend 1-on-1 Tutoring with Dr. Quarshie
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-700">
        Book a personal session to work through tough A&amp;P topics, build
        custom mind maps, or prep for an upcoming exam. Sessions run on
        Saturdays and Sundays via Google Meet.
      </p>

      {/* Pricing */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-red-600">
            First session · 50% off
          </p>
          <p className="mt-2 text-4xl font-bold text-[#7a1f22]">
            $100
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            One-time intro rate. See if Peter&apos;s approach is right for
            you, no commitment after.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-700">
            Standard rate
          </p>
          <p className="mt-2 text-4xl font-bold text-neutral-900">
            $200
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            Per 1-on-1 session, weekends only. Includes a personal mind-map
            walkthrough and follow-up notes.
          </p>
        </div>
      </div>

      {CAL_CONFIGURED ? (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight">
            Pick a time
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <iframe
              src={`https://cal.com/${CAL_USERNAME}/${CAL_EVENT}?embed=true`}
              title="Book a tutoring session"
              className="h-[800px] w-full"
              loading="lazy"
            />
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            Trouble seeing the calendar?{" "}
            <a
              className="underline"
              href={`https://cal.com/${CAL_USERNAME}/${CAL_EVENT}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open booking page in a new tab
            </a>
            .
          </p>
        </>
      ) : (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-lg font-medium">Booking opens soon.</p>
          <p className="mt-2 text-sm text-neutral-600">
            Dr. Quarshie is finalizing his weekend availability. Check back
            shortly to lock in your first session at the intro rate.
          </p>
        </div>
      )}
    </div>
  );
}
