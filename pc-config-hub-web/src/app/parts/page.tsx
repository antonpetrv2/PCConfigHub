import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/server-fetch";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";
import type { ApiCategory } from "@/lib/api/types";
import AddPartLauncher from "@/app/parts/add-part-launcher";

const getSpecsPreview = (part: {
  category: ApiCategory;
  specs: Record<string, unknown>;
}) => {
  switch (part.category) {
    case "motherboard":
      return [
        spec(part.specs.socket, "Socket"),
        spec(part.specs.formFactor, "Form factor"),
        spec(part.specs.ramSlots, "RAM slots"),
        spec(part.specs.ramType, "RAM"),
      ];
    case "cpu":
      return [
        spec(part.specs.socket, "Socket"),
        spec(part.specs.tdp, "TDP"),
        spec(part.specs.cores, "Cores"),
      ];
    case "gpu":
      return [
        spec(part.specs.pciSlot, "PCI"),
        spec(part.specs.vram, "VRAM"),
        spec(part.specs.tdp, "TDP"),
      ];
    case "ram":
      return [
        spec(part.specs.type, "Type"),
        spec(part.specs.capacity, "Capacity"),
        spec(part.specs.speed, "Speed"),
      ];
    case "psu":
      return [
        spec(part.specs.wattage, "Wattage"),
        spec(part.specs.formFactor, "Form factor"),
        spec(part.specs.modular, "Modular"),
      ];
    case "case":
      return [
        spec(part.specs.formFactor, "Form factor"),
        spec(part.specs.psuFormFactor, "PSU"),
        spec(part.specs.maxGpuLength, "Max GPU"),
      ];
    case "storage":
      return [
        spec(part.specs.interface, "Interface"),
        spec(part.specs.capacity, "Capacity"),
        spec(part.specs.type, "Type"),
      ];
    case "soundcard":
      return [spec(part.specs.pciSlot, "PCI")];
    default:
      return [];
  }
};

const spec = (value: unknown, label: string) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return `${label}: ${value.join(", ")}`;
  }
  return `${label}: ${String(value)}`;
};

type PartsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function PartsPage({ searchParams }: PartsPageProps) {
  const params = await searchParams;
  const category = params.category as ApiCategory | undefined;
  const user = await getCurrentUser();

  const parts = await apiFetch<
    Array<{
      id: number;
      name: string;
      manufacturer: string | null;
      model: string | null;
      description: string | null;
      category: ApiCategory;
      ownerUserId: number;
      visibility: "private" | "public";
      specs: Record<string, unknown>;
      images: Array<{ url: string; altText: string | null }>;
    }>
  >(`/api/parts?limit=100${category ? `&category=${category}` : ""}`);

  const isLoggedIn = Boolean(user);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-12 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-24 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Component catalog
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
              Parts catalog
            </h1>
            {isLoggedIn ? (
              <AddPartLauncher />
            ) : (
              <Link
                href="/login?redirectTo=/parts"
                className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]"
              >
                Login to add parts
              </Link>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Categories
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/parts"
                className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                  !category
                    ? "bg-[#30f2ff] text-[#0c0b14]"
                    : "border border-white/10 text-[#b3b7d4]"
                }`}
              >
                All
              </Link>
              {categoryOrder.map((item) => (
                <Link
                  key={item}
                  href={`/parts?category=${item}`}
                  className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                    category === item
                      ? "bg-[#30f2ff] text-[#0c0b14]"
                      : "border border-white/10 text-[#b3b7d4]"
                  }`}
                >
                  {categoryLabels[item]}
                </Link>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            {parts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
                No parts available yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {parts.map((part) => {
                  const specs = getSpecsPreview(part).filter(Boolean);
                  const canEdit = user?.id === part.ownerUserId;
                  return (
                    <article
                      key={part.id}
                      className="flex gap-4 rounded-3xl border border-white/10 bg-[#121126]/90 p-4"
                    >
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#15142a]">
                        {part.images?.[0]?.url ? (
                          <img
                            src={part.images[0].url}
                            alt={part.images[0].altText ?? part.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[#f2f3ff]">
                              {part.name}
                            </p>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                              {categoryLabels[part.category]}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-[#b3b7d4]">
                              {part.visibility === "public" ? "Public" : "Private"}
                            </span>
                            {canEdit ? <AddPartLauncher part={part} /> : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#b3b7d4]">
                          {specs.map((item) => (
                            <span key={item as string}>{item}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

