"use client";

import Link from "next/link";

import { useLanguage } from "@/app/i18n";

export default function GuestAuthLinks() {
  const { t } = useLanguage();

  return (
    <>
      <Link
        href="/login"
        className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        {t.nav.login}
      </Link>
      <Link
        href="/register"
        className="rounded-full border border-[#30f2ff]/60 bg-[#121225] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] shadow-[0_0_12px_rgba(48,242,255,0.35)] transition hover:-translate-y-0.5"
      >
        {t.nav.register}
      </Link>
    </>
  );
}
