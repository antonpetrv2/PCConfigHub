"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/app/i18n";
import LanguageToggle from "@/app/language-toggle";

type AuthMenuProps = {
  logoutAction: (formData: FormData) => void | Promise<void>;
  user: {
    name: string;
    role: string;
  };
};

export default function AuthMenu({ logoutAction, user }: AuthMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={t.authMenu.open}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#30f2ff]/60 bg-[#121225] font-[var(--font-display)] text-sm font-semibold text-[#30f2ff] shadow-[0_0_12px_rgba(48,242,255,0.2)]"
      >
        {initials || "U"}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-[#0f0e1b] p-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <div className="rounded-xl border border-white/10 bg-[#121126] px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#b3b7d4]">
              {t.authMenu.loggedIn}
            </p>
            <p className="mt-1 font-semibold text-[#f2f3ff]">{user.name}</p>
          </div>

          <div className="mt-3 space-y-1">
            {user.role === "admin" ? (
              <Link
                href="/admin/users"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] hover:bg-white/5"
              >
                {t.authMenu.admin}
              </Link>
            ) : null}
            {user.role === "moderator" ? (
              <Link
                href="/moderator"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff] hover:bg-white/5"
              >
                {t.authMenu.moderator}
              </Link>
            ) : null}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
            >
              {t.authMenu.profile}
            </Link>
            <Link
              href="/change-password"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff] hover:bg-white/5"
            >
              {t.authMenu.password}
            </Link>
            <div className="px-3 py-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2f3ff]">
                {t.authMenu.language}
              </p>
              <LanguageToggle compact />
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
              >
                {t.authMenu.logout}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
