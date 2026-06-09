"use client";

import Link from "next/link";

import { useLanguage } from "@/app/i18n";
import LanguageToggle from "@/app/language-toggle";

type ProfileSettingsCopyProps = {
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export default function ProfileSettingsCopy({
  user,
}: ProfileSettingsCopyProps) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="field-label">{t.profile.account}</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[#f2f3ff]">
          {t.profile.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b3b7d4]">
          {t.profile.intro}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-white/10 bg-[#121126]/95 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            {t.profile.signedIn}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f2f3ff]">
            {user.name}
          </h2>
          <p className="mt-1 text-sm text-[#b3b7d4]">{user.email}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b3b7d4]">
              {t.profile.role}
            </span>
            <span className="rounded-full border border-[#30f2ff]/50 bg-[#30f2ff]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#30f2ff]">
              {user.role}
            </span>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#121126]/95 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
            {t.profile.preferences}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[#f2f3ff]">
            {t.profile.languageTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#b3b7d4]">
            {t.profile.languageHelp}
          </p>
          <div className="mt-5">
            <LanguageToggle compact />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#121126]/95 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]">
          {t.profile.security}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#b3b7d4]">
          {t.profile.passwordHelp}
        </p>
        <div className="mt-5">
          <Link
            href="/change-password"
            className="inline-flex rounded-full border border-[#30f2ff]/60 bg-[#30f2ff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0c0b14] shadow-[0_0_14px_rgba(48,242,255,0.28)] transition hover:-translate-y-0.5"
          >
            {t.profile.changePassword}
          </Link>
        </div>
      </section>
    </section>
  );
}
