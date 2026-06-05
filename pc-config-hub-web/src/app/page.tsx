import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { categoryLabels } from "@/lib/api/catalog";
import { listConfigs } from "@/services/api/configs-service";
import { listParts } from "@/services/api/parts-service";

const quickStats = [
  { label: "Validated slots", value: "8" },
  { label: "Build modes", value: "Private / Public" },
  { label: "Review flow", value: "Admin + Moderator" },
];

export default async function Home() {
  const user = await getCurrentUser();
  const [configsData, partsData] = await Promise.all([
    listConfigs({ userId: user?.id, page: 1, limit: 3 }),
    listParts({ userId: user?.id, page: 1, limit: 4 }),
  ]);

  const primaryHref = user ? "/builder" : "/configurations";
  const primaryLabel = user ? "Start builder" : "View configurations";
  const secondaryHref = user ? "/configurations" : "/login";
  const secondaryLabel = user ? "View configurations" : "Login";

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
              PC configuration workspace
            </p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-[#f2f3ff] sm:text-5xl lg:text-6xl">
              {user
                ? `Welcome back, ${user.name}.`
                : "Build cleaner PC configurations with fewer wrong turns."}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#b3b7d4]">
              {user
                ? "Pick parts, check compatibility, save builds, and keep public submissions moving through review."
                : "Browse real PC parts, assemble compatible builds, and save public or private configurations from one full-stack workspace."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="rounded-full border border-[#ff5bf1]/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
              >
                {secondaryLabel}
              </Link>
              {user?.role === "admin" ? (
                <Link
                  href="/admin/users"
                  className="rounded-full border border-[#ffd166]/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd166] hover:bg-[#ffd166]/10"
                >
                  Admin panel
                </Link>
              ) : null}
              {user?.role === "moderator" ? (
                <Link
                  href="/moderator"
                  className="rounded-full border border-[#ffd166]/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd166] hover:bg-[#ffd166]/10"
                >
                  Review queue
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-6 shadow-[0_0_40px_rgba(48,242,255,0.15)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                  Live workspace
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                  {configsData.total} configurations
                </h2>
              </div>
              <span className="rounded-full bg-[#30f2ff]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#30f2ff]">
                Online
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {configsData.configs.length ? (
                configsData.configs.map((config) => (
                  <Link
                    key={config.id}
                    href={`/configurations/${config.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14132a] px-4 py-3 text-sm text-[#f2f3ff] hover:border-[#30f2ff]/50"
                  >
                    <span className="min-w-0 truncate font-semibold">
                      {config.name}
                    </span>
                    <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-[#b3b7d4]">
                      {config.partsCount} parts
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#14132a] px-4 py-3 text-sm text-[#b3b7d4]">
                  No configurations yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#121126]/90 p-5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                {stat.label}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-xl text-[#f2f3ff]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                  Catalog
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                  {partsData.total} accessible parts
                </h2>
              </div>
              <Link
                href="/parts"
                className="rounded-full border border-[#30f2ff]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#30f2ff]"
              >
                Browse
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {partsData.parts.map((part) => (
                <Link
                  key={part.id}
                  href={`/parts/${part.id}`}
                  className="block rounded-2xl border border-white/10 bg-[#0c0b14] px-4 py-3 hover:border-[#30f2ff]/50"
                >
                  <p className="truncate text-sm font-semibold text-[#f2f3ff]">
                    {part.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                    {categoryLabels[part.category]}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Workflow
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-2xl text-[#f2f3ff]">
              From parts to approved build
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["1", "Choose parts", "Filter the catalog and collect the hardware you need."],
                ["2", "Check fit", "Compatibility rules catch socket, slot, and power issues."],
                ["3", "Publish", "Private builds save instantly. Public content waits for review."],
              ].map(([step, title, detail]) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-[#0c0b14] p-4"
                >
                  <span className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                    Step {step}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#f2f3ff]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#b3b7d4]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
