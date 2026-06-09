"use client";

import type { ElementType } from "react";

import { useLanguage } from "@/app/i18n";

type LocalizedTextProps = {
  as?: ElementType;
  className?: string;
  k: string;
  params?: Record<string, string | number>;
};

export default function LocalizedText({
  as: Component = "span",
  className,
  k,
  params,
}: LocalizedTextProps) {
  const { pageText } = useLanguage();

  return <Component className={className}>{pageText(k, params)}</Component>;
}
