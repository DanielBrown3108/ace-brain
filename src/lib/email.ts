import { Resend } from "resend";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ace-brain-seven.vercel.app";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "ACE Brain <onboarding@resend.dev>";

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  const resend = client();
  if (!resend) {
    // Fail silently in dev without a key. We log so it's visible in the
    // server console.
    console.warn(
      "[email] RESEND_API_KEY not set; would have sent:",
      subject,
      "to",
      to
    );
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });
  if (error) {
    console.error("[email] resend error", error);
    return { error };
  }
  return { id: data?.id };
}

// Templates ---------------------------------------------------------------

export function bookingConfirmationEmail(args: {
  studentName: string | null;
  scheduledFor: string;
  durationMinutes: number;
  meetingUrl: string | null;
}) {
  const when = new Date(args.scheduledFor).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const greeting = args.studentName ? `Hi ${args.studentName},` : "Hi,";
  return {
    subject: `Your ACE Brain tutoring session is confirmed`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171717;">
        <h1 style="font-size:22px;color:#1d4ed8;margin:0 0 16px">Your session is confirmed</h1>
        <p>${greeting}</p>
        <p>You're booked with Dr. Peter Amua-Quarshie for a 1-on-1 anatomy &amp; physiology tutoring session.</p>
        <p style="background:#f5ede0;border-radius:8px;padding:16px;font-size:16px"><strong>${when}</strong><br>${args.durationMinutes} minutes</p>
        ${
          args.meetingUrl
            ? `<p>Join via: <a href="${args.meetingUrl}" style="color:#1d4ed8">${args.meetingUrl}</a></p>`
            : `<p>You'll get the meeting link from Cal.com closer to the time.</p>`
        }
        <p>Come with the topics or chapters you want help with. Bring a sheet of paper if you want to mind-map together.</p>
        <p style="color:#737373;font-size:13px;margin-top:32px">Need to reschedule? Use the link in your Cal.com confirmation.</p>
        <p style="color:#737373;font-size:13px"><a href="${SITE_URL}" style="color:#737373">acebrain.com</a></p>
      </div>
    `,
    text:
      `${greeting}\n\nYou're booked with Dr. Peter Amua-Quarshie for a 1-on-1 anatomy & physiology tutoring session.\n\n` +
      `When: ${when}\nLength: ${args.durationMinutes} minutes\n` +
      (args.meetingUrl ? `Join: ${args.meetingUrl}\n\n` : "\n") +
      `Come with the topics you want help with.\n\n${SITE_URL}\n`,
  };
}

export function newLessonEmail(args: {
  lessonTitle: string;
  courseTitle: string;
  lessonUrl: string;
}) {
  return {
    subject: `New lesson: ${args.lessonTitle}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171717;">
        <h1 style="font-size:22px;color:#1d4ed8;margin:0 0 16px">New lesson in ${args.courseTitle}</h1>
        <p style="font-size:18px"><strong>${args.lessonTitle}</strong></p>
        <p><a href="${args.lessonUrl}" style="display:inline-block;background:#1d4ed8;color:white;padding:10px 18px;border-radius:999px;text-decoration:none;margin-top:8px">Watch now</a></p>
        <p style="color:#737373;font-size:13px;margin-top:32px">You're getting this because you've started this course on ACE Brain.</p>
      </div>
    `,
    text: `New lesson in ${args.courseTitle}: ${args.lessonTitle}\n\n${args.lessonUrl}\n`,
  };
}
