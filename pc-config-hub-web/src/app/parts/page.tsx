import Link from "next/link";

import Pagination from "@/app/pagination";
import { getCurrentUser } from "@/lib/auth";
import {
  categoryLabels,
  categoryOrder,
  conditionLabels,
  conditionOrder,
  getCategoryFields,
} from "@/lib/api/catalog";
import type { ApiCategory } from "@/lib/api/types";
import AddPartLauncher from "@/app/parts/add-part-launcher";
import { listParts } from "@/services/api/parts-service";

const getSpecsPreview = (part: {
  category: ApiCategory;
  specs: Record<string, unknown>;
}) => {
  return getCategoryFields(part.category)
    .slice(0, 4)
    .map((field) => spec(part.specs[field.key], field.label));
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
  searchParams: Promise<{
    busType?: string;
    category?: string;
    condition?: string;
    cpuFamily?: string;
    era?: string;
    page?: string;
    search?: string;
    systemType?: string;
    tag?: string;
  }>;
};

const pageSize = 10;

const parsePage = (value?: string) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default async function PartsPage({ searchParams }: PartsPageProps) {
  const params = await searchParams;
  const category = params.category as ApiCategory | undefined;
  const page = parsePage(params.page);
  const user = await getCurrentUser();

  const { parts, total } = await listParts({
    userId: user?.id,
    category,
    search: params.search,
    era: params.era,
    busType: params.busType,
    cpuFamily: params.cpuFamily,
    condition: params.condition as never,
    systemType: params.systemType,
    tag: params.tag,
    page,
    limit: pageSize,
  });

  const isLoggedIn = Boolean(user);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Hardware collection
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
              Retro and PC hardware catalog
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

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
              Categories
            </p>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#121126]/80 p-2">
              <Link
                href="/parts"
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
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
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                    category === item
                      ? "bg-[#30f2ff] text-[#0c0b14]"
                      : "border border-white/10 text-[#b3b7d4]"
                  }`}
                >
                  {categoryLabels[item]}
                </Link>
              ))}
            </div>
          </div>

          <form className="grid gap-3 rounded-2xl border border-white/10 bg-[#121126]/80 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                name="search"
                defaultValue={params.search}
                placeholder="Search"
                className="form-input"
              />
              <input
                name="era"
                defaultValue={params.era}
                placeholder="Era"
                className="form-input"
              />
              <input
                name="busType"
                defaultValue={params.busType}
                placeholder="Bus type"
                className="form-input"
              />
              <input
                name="cpuFamily"
                defaultValue={params.cpuFamily}
                placeholder="CPU family"
                className="form-input"
              />
              <input
                name="systemType"
                defaultValue={params.systemType}
                placeholder="System type"
                className="form-input"
              />
              <input
                name="tag"
                defaultValue={params.tag}
                placeholder="Tag"
                className="form-input"
              />
              <select
                name="condition"
                defaultValue={params.condition ?? ""}
                className="form-input"
              >
                <option value="">Any condition</option>
                {conditionOrder.map((condition) => (
                  <option key={condition} value={condition}>
                    {conditionLabels[condition]}
                  </option>
                ))}
              </select>
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <button
                type="submit"
                className="rounded-full bg-[#30f2ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
              >
                Filter
              </button>
            </form>
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
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#15142a] p-1">
                        {part.images?.[0]?.url ? (
                          <img
                            src={part.images[0].url}
                            alt={part.images[0].altText ?? part.name}
                            className="h-full w-full object-contain"
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
                              <Link
                                href={`/parts/${part.id}`}
                                className="hover:text-[#30f2ff]"
                              >
                                {part.name}
                              </Link>
                            </p>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                              {categoryLabels[part.category]}
                            </p>
                            <p className="mt-1 text-xs text-[#b3b7d4]">
                              {[part.yearEra, conditionLabels[part.condition]]
                                .filter(Boolean)
                                .join(" / ")}
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
                        {part.tags.length ? (
                          <div className="flex flex-wrap gap-2">
                            {part.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[#30f2ff]/30 px-2 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-[#30f2ff]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <Link
                          href={`/parts/${part.id}`}
                          className="mt-auto w-fit text-xs font-semibold uppercase tracking-[0.2em] text-[#30f2ff]"
                        >
                          Details and comments
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <Pagination
              basePath="/parts"
              limit={pageSize}
              page={page}
              searchParams={{
                busType: params.busType,
                category,
                condition: params.condition,
                cpuFamily: params.cpuFamily,
                era: params.era,
                search: params.search,
                systemType: params.systemType,
                tag: params.tag,
              }}
              total={total}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

