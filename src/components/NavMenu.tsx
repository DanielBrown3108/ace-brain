"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Props = {
  isSignedIn: boolean;
  isAdmin: boolean;
  email: string | null;
};

const PUBLIC_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/tutoring", label: "Tutoring" },
  { href: "/book", label: "The Book" },
  { href: "/about", label: "About" },
];

export function NavMenu({ isSignedIn, isAdmin, email }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop links */}
      <div className="hidden items-center gap-6 text-sm md:flex">
        {PUBLIC_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-blue-700">
            {l.label}
          </Link>
        ))}
        {isSignedIn && (
          <Link href="/dashboard" className="hover:text-blue-700">
            Dashboard
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin" className="hover:text-blue-700">
            Admin
          </Link>
        )}
        {isSignedIn ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-4 py-1.5 hover:bg-neutral-50"
              title={email ?? undefined}
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

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100 md:hidden"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white shadow-lg md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <ul className="flex flex-col divide-y divide-neutral-100">
              {PUBLIC_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block py-3 text-base hover:text-blue-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {isSignedIn && (
                <li>
                  <Link
                    href="/dashboard"
                    className="block py-3 text-base hover:text-blue-700"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="block py-3 text-base hover:text-blue-700"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
            <div className="mt-4">
              {isSignedIn ? (
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                  >
                    Sign out{email ? ` (${email})` : ""}
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
