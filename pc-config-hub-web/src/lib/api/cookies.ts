import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/api/constants";

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};
