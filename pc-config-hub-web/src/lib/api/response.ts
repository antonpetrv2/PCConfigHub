import { NextResponse } from "next/server";

type ApiMeta = Record<string, unknown> | null;

export const apiCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export const ok = <T>(data: T, meta: ApiMeta = null, status = 200) => {
  return NextResponse.json(
    { data, error: null, meta },
    { status, headers: apiCorsHeaders }
  );
};

export const fail = (message: string, status = 400, details?: unknown) => {
  const meta = details ? { details } : null;
  return NextResponse.json(
    { data: null, error: message, meta },
    { status, headers: apiCorsHeaders }
  );
};
