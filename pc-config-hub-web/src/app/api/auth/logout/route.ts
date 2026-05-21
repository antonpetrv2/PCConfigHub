import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/api/constants";
import { ok } from "@/lib/api/response";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return ok({ success: true });
}
