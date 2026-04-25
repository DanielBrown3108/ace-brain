const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME || "peter-quarshie";
const CAL_EVENT = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG || "weekend-tutoring";

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
    </div>
  );
}
