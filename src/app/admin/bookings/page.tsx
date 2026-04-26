import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { supabase } = await requireAdmin("/admin/bookings");

  const { data: bookings } = await supabase
    .from("tutoring_bookings")
    .select(
      "id, student_email, student_name, scheduled_for, duration_minutes, meeting_url, status, created_at"
    )
    .order("scheduled_for", { ascending: true });

  const now = new Date();
  const upcoming = (bookings ?? []).filter(
    (b) =>
      b.status === "confirmed" && new Date(b.scheduled_for as string) >= now
  );
  const past = (bookings ?? []).filter(
    (b) =>
      b.status !== "confirmed" || new Date(b.scheduled_for as string) < now
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tutoring bookings</h1>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          &larr; Admin
        </Link>
      </div>

      {(!bookings || bookings.length === 0) && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
          <p className="font-medium">No bookings yet.</p>
          <p className="mt-2">
            Bookings appear here automatically once Peter&apos;s Cal.com
            account is connected and a student books a session. See the README
            for webhook setup.
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">Upcoming</h2>
          <BookingTable bookings={upcoming} />
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-neutral-500">Past</h2>
          <BookingTable bookings={past} muted />
        </>
      )}
    </div>
  );
}

type Booking = {
  id: string;
  student_email: string;
  student_name: string | null;
  scheduled_for: string;
  duration_minutes: number;
  meeting_url: string | null;
  status: string;
  created_at: string;
};

function BookingTable({
  bookings,
  muted = false,
}: {
  bookings: unknown[];
  muted?: boolean;
}) {
  return (
    <ul
      className={`mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200 ${
        muted ? "opacity-60" : ""
      }`}
    >
      {(bookings as Booking[]).map((b) => (
        <li key={b.id} className="px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {b.student_name ?? b.student_email}
              </p>
              <p className="text-xs text-neutral-500">
                {b.student_email} · {b.duration_minutes} min
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span>
                {new Date(b.scheduled_for).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {b.meeting_url && (
                <a
                  href={b.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  Join
                </a>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  b.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : b.status === "completed"
                      ? "bg-neutral-100 text-neutral-600"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {b.status}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
