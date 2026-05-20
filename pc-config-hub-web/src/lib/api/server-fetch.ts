import { headers } from "next/headers";

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

const getBaseUrl = async () => {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Missing host header");
  }
  return `${proto}://${host}`;
};

export const apiFetch = async <T>(path: string, options: FetchOptions = {}) => {
  const headerList = await headers();
  const cookie = headerList.get("cookie");

  const response = await fetch(`${await getBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API request failed: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
};
