"use server";

import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { createUser, findUserByEmail } from "@/services/auth-service";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getSafeRedirectPath = (value: string) => {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value === "/login" || value === "/register") {
    return "/";
  }

  return value;
};

export const registerAction = async (formData: FormData) => {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!displayName || !email || !password) {
    redirect("/register?error=missing");
  }

  if (password.length < 8) {
    redirect("/register?error=weak");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    redirect("/register?error=exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createUser({ email, passwordHash, displayName });

  redirect("/login?registered=1");
};

export const loginAction = async (formData: FormData) => {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirectPath(
    String(formData.get("redirectTo") ?? "/")
  );

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    redirect("/login?error=invalid");
  }

  if (user.approvalStatus !== "approved") {
    redirect("/login?error=pending");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    redirect("/login?error=invalid");
  }

  const token = await signAuthToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
    name: user.displayName ?? user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(redirectTo);
};

export const logoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/");
};
