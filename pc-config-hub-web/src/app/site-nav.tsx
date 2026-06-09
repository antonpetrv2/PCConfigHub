"use client";

import Link from "next/link";

import { useLanguage } from "@/app/i18n";
import LanguageToggle from "@/app/language-toggle";

export default function SiteNav() {
  const { t } = useLanguage();

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto sm:gap-5">
      <Link
        href="/"
        className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        {t.nav.home}
      </Link>
      <Link
        href="/configurations"
        className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        {t.nav.configurations}
      </Link>
      <Link
        href="/catalog"
        className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        {t.nav.catalog}
      </Link>
      <Link
        href="/builder"
        className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
      >
        {t.nav.builder}
      </Link>
      <div className="shrink-0">
        <LanguageToggle />
      </div>
    </div>
  );
}
