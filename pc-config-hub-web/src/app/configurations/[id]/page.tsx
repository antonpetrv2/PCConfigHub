import Link from "next/link";
import { notFound } from "next/navigation";

import ConfigurationActions from "@/app/configurations/configuration-actions";
import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/server-fetch";
import { categoryLabels } from "@/lib/api/catalog";
import type { ApiCategory } from "@/lib/api/types";

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
  const config = await apiFetch<{
    id: number;
    name: string;
    ownerName: string;
    ownerUserId: number;
    description: string | null;
    visibility: "private" | "public";
    compatibility: { compatible: boolean; warnings: string[]; errors: string[] };
    coverImage: string | null;
    coverImageAlt: string | null;
    parts: Array<{
      id: number;
      name: string;
      category: ApiCategory;
      visibility: "private" | "public";
      specs: Record<string, unknown>;
    }>;
  }>(`/api/configs/${configurationId}`);

  const allParts = await apiFetch<
    Array<{
      id: number;
      name: string;
      category: ApiCategory;
      specs: Record<string, unknown>;
    }>
  >("/api/parts?limit=200");

  const comments = await apiFetch<
    Array<{ id: number; authorUserId: number; body: string; createdAt: string }>
  >(`/api/configs/${configurationId}/comments`);

  if (!config) {
    notFound();
  }

  const statusTone = config.compatibility.compatible
    ? "border-[#30f2ff]/40 bg-[#0f1622] text-[#30f2ff]"
    : "border-[#ff5bf1]/40 bg-[#1a1122] text-[#ff5bf1]";
  const canManage = user?.id === config.ownerUserId;

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
            {config.name}
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {config.description ?? "No description yet."}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
            By {config.ownerName}
          </p>
          {canManage ? (
            <ConfigurationActions config={config} parts={allParts} />
          ) : null}
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f0e1b]/90 shadow-[0_0_32px_rgba(48,242,255,0.12)]">
            <div className="aspect-[4/3] w-full bg-[#15142a]">
              {config.coverImage ? (
                <img
                  src={config.coverImage}
                  alt={config.coverImageAlt ?? "Case"}
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
                <span>{config.parts.length} parts</span>
                <span>{config.visibility === "public" ? "Public" : "Private"}</span>
              </div>
              <p>Compatibility: {config.compatibility.compatible ? "Ready" : "Check"}</p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                Compatibility
              </p>
              <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${statusTone}`}>
                {config.compatibility.compatible
                  ? "Compatible configuration"
                  : "Compatibility issues detected"}
              </div>
              {config.compatibility.errors.length ? (
                <div className="mt-3 space-y-1 text-xs text-[#ff5bf1]">
                  {config.compatibility.errors.map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              ) : null}
              {config.compatibility.warnings.length ? (
                <div className="mt-3 space-y-1 text-xs text-[#ffd166]">
                  {config.compatibility.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
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
            {config.parts.map((part) => (
              <div
                key={part.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121126]/90 p-4 text-sm text-[#b3b7d4]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                      {categoryLabels[part.category]}
                    </p>
                    <p className="text-base font-semibold text-[#f2f3ff]">
                      {part.name}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                    {part.visibility === "public" ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                  {Object.entries(part.specs).map(([key, value]) => (
                    <span key={`${part.id}-${key}`}>
                      {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
            Comments
          </h2>
          {comments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-5 text-sm text-[#b3b7d4]">
              No comments yet.
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-[#121126]/90 p-4 text-sm text-[#b3b7d4]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
                    User #{comment.authorUserId}
                  </p>
                  <p className="mt-2 text-sm text-[#f2f3ff]">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
