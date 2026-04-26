import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export async function Nav() {
  const { user, profile } = await getCurrentProfile();

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/brand/logo.png"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
          priority
        />
        <span className="font-semibold tracking-tight text-blue-700">
          ACE Brain
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/courses" className="hover:text-blue-700">
          Courses
        </Link>
        <Link href="/tutoring" className="hover:text-blue-700">
          Tutoring
        </Link>
        <Link href="/book" className="hover:text-blue-700">
          The Book
        </Link>

        {user && (
          <Link href="/dashboard" className="hover:text-blue-700">
            Dashboard
          </Link>
        )}
        {profile?.role === "admin" && (
          <Link href="/admin" className="hover:text-blue-700">
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
            className="rounded-full bg-blue-700 px-4 py-1.5 text-white hover:bg-blue-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
