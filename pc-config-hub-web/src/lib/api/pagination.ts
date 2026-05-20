export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

const toNumber = (value: string | null | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getPagination = (url: URL, defaults = { page: 1, limit: 20 }) => {
  const page = toNumber(url.searchParams.get("page"), defaults.page);
  const limit = Math.min(
    toNumber(url.searchParams.get("limit"), defaults.limit),
    100
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  } satisfies PaginationParams;
};
