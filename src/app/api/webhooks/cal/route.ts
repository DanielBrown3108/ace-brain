import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

// Cal.com fires a JSON webhook for booking events. We accept the
// BOOKING_CREATED, BOOKING_RESCHEDULED, and BOOKING_CANCELLED events
// and mirror them into public.tutoring_bookings so admins can see who
// booked what without leaving the admin panel.
//
// Setup (in Cal.com): Settings -> Developer -> Webhooks -> New
//   URL:           https://<your-site>/api/webhooks/cal
//   Subscribe to:  Booking Created, Booking Rescheduled, Booking Cancelled
//   Secret:        set CAL_WEBHOOK_SECRET in your env to enable signature verification
//
// We also need SUPABASE_SERVICE_ROLE_KEY (a separate env var, NOT the anon key)
// because the inserts run unauthenticated and need to bypass RLS.

type CalPayload = {
  triggerEvent: string;
  payload: {
    uid?: string;
    bookingId?: number;
    title?: string;
    startTime?: string;
    endTime?: string;
    length?: number;
    location?: string;
    metadata?: Record<string, string> & { videoCallUrl?: string };
    attendees?: Array<{ name?: string; email?: string }>;
    organizer?: { name?: string; email?: string };
    rescheduledFrom?: string;
  };
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const sig = request.headers.get("x-cal-signature-256");
    if (!sig) {
      return NextResponse.json({ error: "missing signature" }, { status: 401 });
    }
    // HMAC verification — left as a TODO; until then, only enable the webhook
    // in Cal.com if your URL is unguessable, or implement Web Crypto HMAC here.
  }

  let body: CalPayload;
  try {
    body = (await request.json()) as CalPayload;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "server not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  const { triggerEvent, payload } = body;
  const calBookingId = String(payload.uid ?? payload.bookingId ?? "");
  if (!calBookingId) {
    return NextResponse.json({ error: "missing booking id" }, { status: 400 });
  }

  const attendee = payload.attendees?.[0];
  const studentEmail = attendee?.email ?? "unknown@unknown";
  const studentName = attendee?.name ?? null;
  const scheduledFor = payload.startTime ?? new Date().toISOString();
  const meetingUrl =
    payload.metadata?.videoCallUrl ?? payload.location ?? null;
  const minutes =
    payload.length ??
    (payload.startTime && payload.endTime
      ? Math.round(
          (new Date(payload.endTime).getTime() -
            new Date(payload.startTime).getTime()) /
            60000
        )
      : 60);

  if (triggerEvent === "BOOKING_CANCELLED") {
    await supabase
      .from("tutoring_bookings")
      .update({ status: "cancelled" })
      .eq("cal_booking_id", calBookingId);
    return NextResponse.json({ ok: true });
  }

  // Try to attach the booking to a Supabase user by email.
  let userId: string | null = null;
  const { data: matchedUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("display_name", studentEmail)
    .maybeSingle();
  if (matchedUser) userId = matchedUser.id as string;

  await supabase.from("tutoring_bookings").upsert(
    {
      cal_booking_id: calBookingId,
      user_id: userId,
      student_email: studentEmail,
      student_name: studentName,
      scheduled_for: scheduledFor,
      duration_minutes: minutes,
      meeting_url: meetingUrl,
      status: "confirmed",
    },
    { onConflict: "cal_booking_id" }
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "cal-webhook" });
}
