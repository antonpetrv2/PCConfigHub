import "server-only";

import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";

export const AUTH_COOKIE_NAME = "auth_token";

export type CurrentUser = {
  id: number;
  email: string;
  role: string;
  name: string;
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
};
