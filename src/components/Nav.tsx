import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export async function Nav() {
  const { user, profile } = await getCurrentProfile();

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" className="font-semibold tracking-tight">
        Quarshie Academy
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        <Link href="/tutoring" className="hover:underline">
          Tutoring
        </Link>
        <Link href="/book" className="hover:underline">
          The Book
        </Link>

        {user && (
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        )}
        {profile?.role === "admin" && (
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        )}

        {user ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-4 py-1.5 hover:bg-neutral-50"
              title={user.email ?? undefined}
            >
              Sign out
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-white hover:bg-neutral-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
