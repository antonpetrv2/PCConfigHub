import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/server-fetch";

export default async function ConfigurationsPage() {
  const user = await getCurrentUser();
  const configurations = await apiFetch<
    Array<{
      id: number;
      name: string;
      ownerName: string;
      ownerUserId: number;
      visibility: "private" | "public";
      coverImage: string | null;
      coverImageAlt: string | null;
      partsCount: number;
      estimatedWattage: number;
    }>
  >("/api/configs?limit=100");

  const publicConfigs = configurations.filter(
    (config) => config.visibility === "public"
  );
  const myConfigs = user
    ? configurations.filter((config) => config.ownerUserId === user.id)
    : [];

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

        {publicConfigs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
            No configurations available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {publicConfigs.map((config) => (
              <article
                key={config.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f0e1b]/90 shadow-[0_0_30px_rgba(48,242,255,0.12)]"
              >
                <Link
                  href={`/configurations/${config.id}`}
                  className="group relative block aspect-[16/10] w-full bg-[#15142a] p-3"
                >
                  {config.coverImage ? (
                    <img
                      src={config.coverImage}
                      alt={config.coverImageAlt ?? "Case"}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
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
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                    <span>{config.partsCount} parts</span>
                    <span>{config.estimatedWattage}W est.</span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                    By {config.ownerName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {user && myConfigs.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
              My configs
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {myConfigs.map((config) => (
                <article
                  key={`my-${config.id}`}
                  className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121126]/90"
                >
                  <Link
                    href={`/configurations/${config.id}`}
                    className="group relative block aspect-[16/10] w-full bg-[#15142a] p-3"
                  >
                    {config.coverImage ? (
                      <img
                        src={config.coverImage}
                        alt={config.coverImageAlt ?? "Case"}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                        No case image yet
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
                        {config.name}
                      </h3>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                        {config.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                      <span>{config.partsCount} parts</span>
                      <span>{config.estimatedWattage}W est.</span>
                    </div>
                    <Link
                      href={`/configurations/${config.id}`}
                      className="mt-2 w-fit rounded-full border border-[#30f2ff]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]"
                    >
                      Open / manage
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
