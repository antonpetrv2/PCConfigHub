import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import AddPartLauncher from "@/app/parts/add-part-launcher";
import CatalogResults from "@/app/catalog/catalog-results";
import { categoryLabels, categoryOrder } from "@/lib/api/catalog";
import type { ApiCategory } from "@/lib/api/types";
import { listParts } from "@/services/api/parts-service";

type CatalogPageProps = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

const pageSize = 10;

const parsePage = (value?: string) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const category = params.category as ApiCategory | undefined;
  const user = await getCurrentUser();
  const { parts, total } = await listParts({
    userId: user?.id,
    category,
    page,
    limit: pageSize,
  });

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f0e1b]/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
              Hardware collection
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-2">
              <h1 className="font-[var(--font-display)] text-3xl text-[#f2f3ff]">
                Catalog
              </h1>
              <p className="pb-1 text-sm text-[#b3b7d4]">
                {user
                  ? "Showing public components plus your private inventory."
                  : "Showing public components only. Sign in to see your private parts."}
              </p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col gap-3 text-sm text-[#b3b7d4] lg:max-w-xl lg:flex-row lg:items-center lg:justify-end">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-[#30f2ff]">
                  Upload parts
                </p>
                <p className="mt-1 text-sm">
                  Add hardware with specs, tags, logs, and photos.
                </p>
              </div>
              <AddPartLauncher />
            </div>
          ) : null}
        </header>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b3b7d4]">
            Categories
          </p>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#121126]/80 p-2">
            <Link
              href="/catalog"
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
                href={`/catalog?category=${item}`}
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

        <CatalogResults
          basePath="/catalog"
          category={category}
          initialPage={page}
          initialParts={parts}
          initialTotal={total}
          limit={pageSize}
          userId={user?.id}
        />
      </div>
    </section>
  );
}
