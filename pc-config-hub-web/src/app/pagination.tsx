import Link from "next/link";

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

const buildHref = (
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export default function Pagination({
  page,
  limit,
  total,
  basePath,
  searchParams = {},
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121126]/80 px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#b3b7d4]">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex flex-wrap gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, searchParams, page - 1)}
            className="rounded-full border border-white/10 px-3 py-2 hover:border-[#30f2ff]/60 hover:text-[#30f2ff]"
          >
            Prev
          </Link>
        ) : null}
        {pages.map((item) => (
          <Link
            key={item}
            href={buildHref(basePath, searchParams, item)}
            className={`rounded-full px-3 py-2 ${
              item === page
                ? "bg-[#30f2ff] text-[#0c0b14]"
                : "border border-white/10 hover:border-[#30f2ff]/60 hover:text-[#30f2ff]"
            }`}
          >
            {item}
          </Link>
        ))}
        {page < totalPages ? (
          <Link
            href={buildHref(basePath, searchParams, page + 1)}
            className="rounded-full border border-white/10 px-3 py-2 hover:border-[#30f2ff]/60 hover:text-[#30f2ff]"
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
