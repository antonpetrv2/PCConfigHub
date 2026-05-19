import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { listVisibleConfigurations } from "@/services/configuration-service";

export default async function ConfigurationsPage() {
  const user = await getCurrentUser();
  const configurations = await listVisibleConfigurations(user?.id);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-32 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Approved builds gallery
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Ready configurations
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {user
              ? "Showing public builds plus your private configurations. Only builds that include a case are listed."
              : "Showing public builds only. Sign in to see your private configurations. Only builds that include a case are listed."}
          </p>
        </header>

        <div className="rounded-2xl border border-[#ffd166]/40 bg-[#16142b]/80 px-4 py-3 text-sm text-[#ffd166]">
          Public configurations and components can be commented on, but comments appear
          only after moderator approval.
        </div>

        {configurations.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
            No configurations available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {configurations.map((config) => (
              <article
                key={config.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f0e1b]/90 shadow-[0_0_30px_rgba(48,242,255,0.12)]"
              >
                <Link
                  href={`/configurations/${config.id}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden bg-[#15142a]"
                >
                  {config.caseImageUrl ? (
                    <img
                      src={config.caseImageUrl}
                      alt={config.caseImageAlt ?? config.caseName ?? "Case"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                      No case image yet
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-[#0f0e1b]/80 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#f2f3ff]">
                    View details
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
                      {config.name}
                    </h2>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                      {config.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-sm text-[#b3b7d4]">
                    {config.description ?? "No description yet."}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                    <span>{config.componentCount} components</span>
                    <span>Case: {config.caseName ?? "Missing"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
