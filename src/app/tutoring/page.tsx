const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME;
const CAL_EVENT = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG;
const CAL_CONFIGURED = Boolean(CAL_USERNAME && CAL_EVENT);

export default function TutoringPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Weekend 1-on-1 Tutoring with Dr. Quarshie
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Book a personal session to work through tough A&amp;P topics, build
        custom mind maps, or prep for an upcoming exam. Sessions run on
        Saturdays and Sundays via Google Meet.
      </p>

      {CAL_CONFIGURED ? (
        <>
          <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
            shortly, or{" "}
            <a
              href="mailto:hello@example.com"
              className="underline"
            >
              email us
            </a>{" "}
            to be notified when slots go live.
          </p>
        </div>
      )}
    </div>
  );
}
