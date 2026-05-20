import { NextResponse } from "next/server";

type ApiMeta = Record<string, unknown> | null;

export const ok = <T>(data: T, meta: ApiMeta = null, status = 200) => {
  return NextResponse.json({ data, error: null, meta }, { status });
};

export const fail = (message: string, status = 400, details?: unknown) => {
  const meta = details ? { details } : null;
  return NextResponse.json({ data: null, error: message, meta }, { status });
};
