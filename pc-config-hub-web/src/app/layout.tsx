import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import AuthMenu from "@/app/auth-menu";
import FooterTagline from "@/app/footer-tagline";
import GuestAuthLinks from "@/app/guest-auth-links";
import { LanguageProvider } from "@/app/i18n";
import SiteNav from "@/app/site-nav";

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
        <LanguageProvider>
          <header className="border-b border-white/10 bg-[#0f0e1b] bg-grid-faint">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link
                href="/"
                className="shrink-0 font-[var(--font-display)] text-lg font-semibold tracking-[0.2em] text-[#30f2ff]"
              >
                PCConfigHub
              </Link>
              <nav className="flex min-w-0 items-center gap-2 text-sm sm:gap-5">
                <SiteNav />
                <div className="shrink-0">
                  <AuthNav userPromise={userPromise} />
                </div>
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
              <FooterTagline />
            </div>
          </footer>
        </LanguageProvider>
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
    return <GuestAuthLinks />;
  }

  return (
    <AuthMenu logoutAction={logoutAction} user={user} />
  );
}
