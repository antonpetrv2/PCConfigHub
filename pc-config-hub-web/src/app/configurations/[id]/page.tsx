import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { componentTypeLabels } from "@/types/component-types";
import { getConfigurationDetails } from "@/services/configuration-service";

type ConfigurationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConfigurationDetailsPage({
  params,
}: ConfigurationDetailsPageProps) {
  const { id } = await params;
  const configurationId = Number(id);
  if (!Number.isFinite(configurationId)) {
    notFound();
  }

  const user = await getCurrentUser();
  const details = await getConfigurationDetails(configurationId, user?.id);

  if (!details) {
    notFound();
  }

  const { summary, components } = details;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-12 h-60 w-60 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-16 top-20 h-52 w-52 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-3">
          <Link
            href="/configurations"
            className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]"
          >
            Back to configurations
          </Link>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            {summary.name}
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {summary.description ?? "No description yet."}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f0e1b]/90 shadow-[0_0_32px_rgba(48,242,255,0.12)]">
            <div className="aspect-[4/3] w-full bg-[#15142a]">
              {summary.caseImageUrl ? (
                <img
                  src={summary.caseImageUrl}
                  alt={summary.caseImageAlt ?? summary.caseName ?? "Case"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                  No case image yet
                </div>
              )}
            </div>
            <div className="space-y-2 px-5 py-4 text-sm text-[#b3b7d4]">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#30f2ff]">
                <span>{summary.componentCount} components</span>
                <span>{summary.visibility === "public" ? "Public" : "Private"}</span>
              </div>
              <p>Case: {summary.caseName ?? "Missing"}</p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                Compatibility
              </p>
              <p className="mt-2">
                Each component is matched against motherboard slots and case PSU
                support. If any mismatch is detected, the build cannot be saved.
              </p>
            </div>
            <div className="rounded-3xl border border-[#ffd166]/40 bg-[#16142b]/80 p-5 text-sm text-[#ffd166]">
              Public configurations and components can be commented on, but comments
              appear only after moderator approval.
            </div>
          </aside>
        </div>

        <div className="space-y-4">
          <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
            Included components
          </h2>
          <div className="grid gap-4">
            {components.map((component) => (
              <div
                key={component.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121126]/90 p-4 text-sm text-[#b3b7d4]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                      {componentTypeLabels[component.type]}
                    </p>
                    <p className="text-base font-semibold text-[#f2f3ff]">
                      {component.name}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                    {component.visibility === "public" ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                  {component.cpuSocket ? <span>CPU: {component.cpuSocket}</span> : null}
                  {component.ramType ? <span>RAM: {component.ramType}</span> : null}
                  {component.gpuSlotType ? (
                    <span>GPU slot: {component.gpuSlotType}</span>
                  ) : null}
                  {component.videoSlotType ? (
                    <span>GPU card: {component.videoSlotType}</span>
                  ) : null}
                  {component.soundSlotType ? (
                    <span>Sound slot: {component.soundSlotType}</span>
                  ) : null}
                  {component.soundCardSlotType ? (
                    <span>Sound card: {component.soundCardSlotType}</span>
                  ) : null}
                  {component.psuType ? <span>PSU: {component.psuType}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
