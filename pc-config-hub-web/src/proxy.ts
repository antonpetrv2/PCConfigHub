import { NextResponse, type NextRequest } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { apiCorsHeaders } from "@/lib/api/response";

const AUTH_COOKIE_NAME = "auth_token";
const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/setup-admin"]);

const getLoginUrl = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  const redirectTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (redirectTo !== "/") {
    loginUrl.searchParams.set("redirectTo", redirectTo);
  }

  return loginUrl;
};

const isSafeRedirect = (value: string | null) => {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
};

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: apiCorsHeaders,
      });
    }

    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return isPublicPath
      ? NextResponse.next()
      : NextResponse.redirect(getLoginUrl(request));
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    const response = isPublicPath
      ? NextResponse.next()
      : NextResponse.redirect(getLoginUrl(request));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  if (pathname === "/login" || pathname === "/register") {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const safeRedirectTo =
      redirectTo && isSafeRedirect(redirectTo) ? redirectTo : "/";
    return NextResponse.redirect(new URL(safeRedirectTo, request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
