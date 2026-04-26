import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_TITLE = "Ace Brain · Visual Anatomy & Physiology";
const SITE_DESCRIPTION =
  "Master anatomy & physiology through mind mapping with Dr. Peter Quarshie. Free lessons, weekend 1-on-1 tutoring, and the Illustrated Mind Mapping for A&P companion course.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s · Ace Brain",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Ace Brain",
  authors: [{ name: "Dr. Peter Quarshie" }],
  keywords: [
    "anatomy",
    "physiology",
    "mind mapping",
    "pre-med",
    "nursing",
    "A&P",
    "Peter Quarshie",
  ],
  openGraph: {
    type: "website",
    siteName: "Ace Brain",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <Nav />
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Dr. Peter Quarshie
        </footer>
      </body>
    </html>
  );
}
