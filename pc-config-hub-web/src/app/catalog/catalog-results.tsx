"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Pagination from "@/app/pagination";
import AddPartLauncher from "@/app/parts/add-part-launcher";
import {
  categoryLabels,
  categoryOrder,
  getCategoryFields,
} from "@/lib/api/catalog";
import type { ApiCategory, ItemCondition } from "@/lib/api/types";

type CatalogPart = {
  id: number;
  category: ApiCategory;
  ownerUserId: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  yearEra: string | null;
  countryOfOrigin: string | null;
  serialNumber: string | null;
  inventoryNumber: string | null;
  condition: ItemCondition;
  description: string | null;
  notes: string | null;
  tags: string[];
  location: string | null;
  acquisitionDate: string | null;
  source: string | null;
  purchasePrice: string | null;
  estimatedValue: string | null;
  visibility: "private" | "public";
  approvalStatus: "pending" | "approved" | "rejected";
  specs: Record<string, unknown>;
  customFields: Record<string, unknown>;
  images: Array<{ url: string; altText: string | null; sortOrder: number }>;
  testLogs: Array<Record<string, unknown>>;
  restorationLogs: Array<Record<string, unknown>>;
};

type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  meta: { total?: number } | null;
};

type CatalogResultsProps = {
  basePath: string;
  category?: ApiCategory;
  initialPage: number;
  initialParts: CatalogPart[];
  initialTotal: number;
  limit: number;
  userId?: number;
};

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const formatSpecs = (part: CatalogPart) =>
  getCategoryFields(part.category)
    .slice(0, 4)
    .map((field) => {
      const value = formatValue(part.specs[field.key]);
      return value ? `${field.label}: ${value}` : null;
    })
    .filter((value): value is string => Boolean(value));

export default function CatalogResults({
  basePath,
  category,
  initialPage,
  initialParts,
  initialTotal,
  limit,
  userId,
}: CatalogResultsProps) {
  const [query, setQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchParts, setSearchParts] = useState<CatalogPart[]>(initialParts);
  const [searchTotal, setSearchTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  useEffect(() => {
    if (!isSearching) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(searchPage),
      search: trimmedQuery,
    });

    if (category) {
      params.set("category", category);
    }

    fetch(`/api/parts?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as ApiEnvelope<CatalogPart[]>;
        if (!response.ok || payload.error || !payload.data) {
          throw new Error(payload.error ?? "Search failed.");
        }

        setSearchParts(payload.data);
        setSearchTotal(Number(payload.meta?.total ?? payload.data.length));
        setError(null);
      })
      .catch((searchError) => {
        if ((searchError as Error).name !== "AbortError") {
          setError(searchError instanceof Error ? searchError.message : "Search failed.");
        }
      })

    return () => controller.abort();
  }, [
    category,
    initialParts,
    initialTotal,
    isSearching,
    limit,
    searchPage,
    trimmedQuery,
  ]);

  const parts = isSearching ? searchParts : initialParts;
  const total = isSearching ? searchTotal : initialTotal;
  const page = isSearching ? searchPage : initialPage;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const grouped = useMemo(() => {
    const emptyGroups = {} as Record<ApiCategory, CatalogPart[]>;
    for (const item of categoryOrder) {
      emptyGroups[item] = [];
    }

    return parts.reduce<Record<ApiCategory, CatalogPart[]>>((acc, part) => {
      acc[part.category].push(part);
      return acc;
    }, emptyGroups);
  }, [parts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#121126]/80 p-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="catalog-live-search">
          Search catalog
        </label>
        <input
          id="catalog-live-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchPage(1);
            setError(null);
          }}
          placeholder="Search by name, manufacturer, model, description, or tag"
          className="form-input"
        />
        <span className="shrink-0 px-2 text-xs uppercase tracking-[0.2em] text-[#b3b7d4]">
          {total} items
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#ff5bf1]/40 bg-[#1a1122] px-4 py-3 text-sm text-[#ff5bf1]">
          {error}
        </div>
      ) : null}

      {parts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121126]/90 p-6 text-sm text-[#b3b7d4]">
          No components available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {categoryOrder.map((item) => {
            const items = grouped[item];
            if (!items.length) {
              return null;
            }

            return (
              <section key={item} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-[var(--font-display)] text-2xl text-[#f2f3ff]">
                    {categoryLabels[item]}
                  </h2>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
                    {items.length} items
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((part) => (
                    <PartCard key={part.id} part={part} userId={userId} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {isSearching ? (
        totalPages > 1 ? (
          <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121126]/80 px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#b3b7d4]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setSearchPage((value) => Math.max(1, value - 1))}
                className="rounded-full border border-white/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setSearchPage((value) => Math.min(totalPages, value + 1))
                }
                className="rounded-full border border-white/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </nav>
        ) : null
      ) : (
        <Pagination
          basePath={basePath}
          limit={limit}
          page={initialPage}
          searchParams={{ category }}
          total={initialTotal}
        />
      )}
    </div>
  );
}

function PartCard({ part, userId }: { part: CatalogPart; userId?: number }) {
  const specs = formatSpecs(part);
  const canEdit = userId === part.ownerUserId;

  return (
    <article className="flex gap-4 rounded-3xl border border-white/10 bg-[#121126]/90 p-4">
      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#15142a] p-1">
        {part.images[0]?.url ? (
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#f2f3ff]">
              <Link href={`/parts/${part.id}`} className="hover:text-[#30f2ff]">
                {part.name}
              </Link>
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
              {part.visibility === "public" ? "Public" : "Private"}
            </p>
          </div>
          {canEdit ? <AddPartLauncher part={part} /> : null}
        </div>
        <p className="text-sm text-[#b3b7d4]">
          {part.description ?? "No description yet."}
        </p>
        {specs.length ? (
          <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#b3b7d4]">
            {specs.map((item) => (
              <span key={item}>{item}</span>
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
}
