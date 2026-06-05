import Link from "next/link";

import Pagination from "@/app/pagination";
import { getCurrentUser } from "@/lib/auth";
import { listConfigs } from "@/services/api/configs-service";

type ConfigurationsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

const pageSize = 9;

const parsePage = (value?: string) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default async function ConfigurationsPage({
  searchParams,
}: ConfigurationsPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const user = await getCurrentUser();
  const { configs, total } = await listConfigs({
    userId: user?.id,
    page,
    limit: pageSize,
  });

  const myConfigs = user ? configs.filter((config) => config.ownerUserId === user.id) : [];

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

        {configs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
            No configurations available yet.
          </div>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configs.map((config) => (
              <article
                key={config.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0e1b]/90 shadow-[0_0_22px_rgba(48,242,255,0.1)]"
              >
                <Link
                  href={`/configurations/${config.id}`}
                  className="group relative block h-[360px] w-full bg-[#15142a] p-2 sm:h-[380px] lg:h-[420px]"
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
                  <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-[#0f0e1b]/80 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#f2f3ff]">
                    View details
                  </div>
                </Link>
                <div className="flex min-h-[150px] flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-[var(--font-display)] text-lg text-[#f2f3ff]">
                      {config.name}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[0.55rem] uppercase tracking-[0.22em] text-[#b3b7d4]">
                      {config.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[0.68rem] uppercase tracking-[0.18em] text-[#30f2ff]">
                    <span>{config.partsCount} parts</span>
                    <span>{config.estimatedWattage}W est.</span>
                  </div>
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[#b3b7d4]">
                    By {config.ownerName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          basePath="/configurations"
          limit={pageSize}
          page={page}
          total={total}
        />

        {user && myConfigs.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
              My configs
            </h2>
            <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myConfigs.map((config) => (
                <article
                  key={`my-${config.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121126]/90"
                >
                  <Link
                    href={`/configurations/${config.id}`}
                    className="group relative block h-[360px] w-full bg-[#15142a] p-2 sm:h-[380px] lg:h-[420px]"
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
                  <div className="flex min-h-[150px] flex-1 flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-[var(--font-display)] text-lg text-[#f2f3ff]">
                        {config.name}
                      </h3>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[0.55rem] uppercase tracking-[0.22em] text-[#b3b7d4]">
                        {config.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[0.68rem] uppercase tracking-[0.18em] text-[#30f2ff]">
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
