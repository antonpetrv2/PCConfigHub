import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const displayFont = Oxanium({
  variable: "--font-display",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PCConfigHub",
  description: "Build and manage PC configurations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-white/10 bg-[#0f0e1b] bg-grid-faint">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="font-[var(--font-display)] text-lg font-semibold tracking-[0.2em] text-[#30f2ff]"
            >
              PCConfigHub
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm sm:gap-5">
              <Link
                href="/"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-[#30f2ff]/60 bg-[#121225] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] shadow-[0_0_12px_rgba(48,242,255,0.35)] transition hover:-translate-y-0.5"
              >
                Register
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 font-[var(--font-body)] bg-grid">
          {children}
        </main>
        <footer className="border-t border-white/10 bg-[#0f0e1b]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs uppercase tracking-[0.2em] text-[#b3b7d4] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-[var(--font-display)] text-[#30f2ff]">
              PCConfigHub
            </span>
            <span>Retro-futurist hardware lab interface.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
