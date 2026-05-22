import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyAuthToken } from "@/lib/jwt";

export type ApiAuthUser = {
  id: number;
  email: string;
  role: "admin" | "moderator" | "user";
  name: string;
};

const AUTH_COOKIE_NAME = "auth_token";

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice(7).trim();
};

export const getAuthToken = async (request: NextRequest) => {
  const bearer = getBearerToken(request);
  if (bearer) {
    return bearer;
  }

  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
};

export const requireUser = async (request: NextRequest) => {
  const token = await getAuthToken(request);
  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, Number(payload.sub)), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
    role: payload.role as ApiAuthUser["role"],
    name: payload.name,
  } satisfies ApiAuthUser;
};

export const requireRole = (
  user: ApiAuthUser | null,
  roles: ApiAuthUser["role"][]
) => {
  return Boolean(user && roles.includes(user.role));
};
