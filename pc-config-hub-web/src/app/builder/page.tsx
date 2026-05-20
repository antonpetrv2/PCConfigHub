import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/server-fetch";
import BuilderClient from "@/app/builder/builder-client";
import type { ApiCategory } from "@/lib/api/types";

export default async function BuilderPage() {
  const user = await getCurrentUser();

  let parts: Array<{
    id: number;
    name: string;
    category: ApiCategory;
    specs: Record<string, unknown>;
  }> = [];
  let loadError: string | null = null;

  try {
    parts = await apiFetch<
      Array<{ id: number; name: string; category: ApiCategory; specs: Record<string, unknown> }>
    >("/api/parts?limit=200");
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load parts.";
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-32 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Configuration lab
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Build a new configuration
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {user
              ? "Mix public and private parts, then validate compatibility before saving."
              : "Select from public parts to explore compatibility. Sign in to save configurations."}
          </p>
        </header>

        {loadError ? (
          <div className="rounded-3xl border border-[#ff5bf1]/40 bg-[#1a1122] px-5 py-4 text-sm text-[#ff5bf1]">
            Unable to load parts right now. Check server logs for details.
          </div>
        ) : (
          <BuilderClient parts={parts} isLoggedIn={Boolean(user)} />
        )}
      </div>
    </section>
  );
}
