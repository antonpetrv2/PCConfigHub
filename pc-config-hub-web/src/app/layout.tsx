import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getCurrentUser();

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
                href="/configurations"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
              >
                Configurations
              </Link>
              <Link
                href="/catalog"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
              >
                Parts Catalog
              </Link>
              <Link
                href="/builder"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
              >
                Builder
              </Link>
              <AuthNav userPromise={userPromise} />
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

async function AuthNav({
  userPromise,
}: {
  userPromise: ReturnType<typeof getCurrentUser>;
}) {
  const user = await userPromise;

  if (!user) {
    return (
      <>
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
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {user.role === "admin" ? (
        <Link
          href="/admin/users"
          className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] hover:bg-white/5"
        >
          Admin
        </Link>
      ) : null}
      {user.role === "moderator" ? (
        <Link
          href="/moderator"
          className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] hover:bg-white/5"
        >
          Moderator
        </Link>
      ) : null}
      <div className="flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#121225] px-4 py-2 text-xs text-[#b3b7d4]">
        <span className="uppercase tracking-[0.2em]">Logged in:</span>
        <span className="font-semibold text-[#f2f3ff]">{user.name}</span>
      </div>
      <Link
        href="/change-password"
        className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        Password
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-[#ff5bf1]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
