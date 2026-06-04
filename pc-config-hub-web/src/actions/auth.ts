"use server";

import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, getCurrentUser } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api/errors";
import { createUser, findUserByEmail } from "@/services/auth-service";
import {
  changePassword,
  requestPasswordReset,
  resetPassword,
} from "@/services/api/password-service";

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

const withError = (path: string, error: string) => `${path}?error=${error}`;

const getRequestOrigin = async () => {
  const headerStore = await headers();
  const host = headerStore.get("host");
  if (!host) {
    return undefined;
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
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

export const forgotPasswordAction = async (formData: FormData) => {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!email) {
    redirect(withError("/forgot-password", "missing"));
  }

  const result = await requestPasswordReset({
    email,
    origin: await getRequestOrigin(),
  });
  const resetUrlParam = result.resetUrl
    ? `&resetUrl=${encodeURIComponent(result.resetUrl)}`
    : "";

  redirect(`/forgot-password?sent=1${resetUrlParam}`);
};

export const resetPasswordAction = async (formData: FormData) => {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !password || !confirmPassword) {
    redirect(withError("/reset-password", "missing"));
  }

  if (password.length < 8) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=weak`);
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=mismatch`);
  }

  let redirectTo = "/login?reset=1";
  try {
    await resetPassword({ token, password });
  } catch (error) {
    const message =
      error instanceof ApiError && error.status === 400 ? "invalid" : "failed";
    redirectTo = `/reset-password?token=${encodeURIComponent(
      token
    )}&error=${message}`;
  }

  redirect(redirectTo);
};

export const changePasswordAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/change-password");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect(withError("/change-password", "missing"));
  }

  if (newPassword.length < 8) {
    redirect(withError("/change-password", "weak"));
  }

  if (newPassword !== confirmPassword) {
    redirect(withError("/change-password", "mismatch"));
  }

  let redirectTo = "/change-password?changed=1";
  try {
    await changePassword({
      userId: user.id,
      currentPassword,
      newPassword,
    });
  } catch (error) {
    const message =
      error instanceof ApiError && error.status === 400 ? "incorrect" : "failed";
    redirectTo = `/change-password?error=${message}`;
  }

  redirect(redirectTo);
};
