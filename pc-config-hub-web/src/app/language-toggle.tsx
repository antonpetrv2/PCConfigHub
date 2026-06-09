"use client";

import { useLanguage, type SiteLanguage } from "@/app/i18n";

type LanguageToggleProps = {
  compact?: boolean;
};

const languages: Array<{ value: SiteLanguage; label: string }> = [
  { value: "en", label: "EN" },
  { value: "bg", label: "BG" },
];

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      aria-label="Site language"
      className={`inline-flex rounded-full border border-white/10 bg-[#121126] p-1 ${
        compact ? "w-full" : ""
      }`}
      role="group"
    >
      {languages.map((item) => {
        const isActive = language === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLanguage(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              compact ? "flex-1" : ""
            } ${
              isActive
                ? "bg-[#30f2ff] text-[#0c0b14] shadow-[0_0_14px_rgba(48,242,255,0.32)]"
                : "text-[#b3b7d4] hover:bg-white/5 hover:text-[#f2f3ff]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
