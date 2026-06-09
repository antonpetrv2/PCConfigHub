"use client";

import { useLanguage } from "@/app/i18n";

export default function FooterTagline() {
  const { t } = useLanguage();

  return <span>{t.footer.tagline}</span>;
}
