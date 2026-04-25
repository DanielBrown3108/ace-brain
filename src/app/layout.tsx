import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quarshie Academy — Visual Anatomy & Physiology",
  description:
    "Master anatomy & physiology through mind mapping with Dr. Peter Quarshie. Free lessons, weekend 1-on-1 tutoring, and the Illustrated Mind Mapping for A&P companion course.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              Quarshie Academy
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/courses" className="hover:underline">Courses</Link>
              <Link href="/tutoring" className="hover:underline">Tutoring</Link>
              <Link href="/book" className="hover:underline">The Book</Link>
              <Link
                href="/login"
                className="rounded-full bg-neutral-900 px-4 py-1.5 text-white hover:bg-neutral-700"
              >
                Sign in
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Dr. Peter Quarshie
        </footer>
      </body>
    </html>
  );
}
