import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

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
