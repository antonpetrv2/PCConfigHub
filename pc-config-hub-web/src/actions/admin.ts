"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  createAdminUser,
  deleteUserAndContent,
  hasAdminUser,
  setUserApprovalStatus,
  setUserRole,
  type UserApprovalStatus,
  type UserRole,
} from "@/services/admin-service";
import { findUserByEmail } from "@/services/auth-service";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/users");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
};

const parseUserId = (formData: FormData) => {
  const userId = Number(formData.get("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user id");
  }

  return userId;
};

export const createFirstAdminAction = async (formData: FormData) => {
  if (await hasAdminUser()) {
    redirect("/login");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!displayName || !email || !password) {
    redirect("/setup-admin?error=missing");
  }

  if (password.length < 8) {
    redirect("/setup-admin?error=weak");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    redirect("/setup-admin?error=exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createAdminUser({ email, passwordHash, displayName });

  redirect("/login?registered=admin");
};

export const approveUserAction = async (formData: FormData) => {
  const admin = await requireAdmin();

  await setUserApprovalStatus({
    userId: parseUserId(formData),
    status: "approved",
    reviewedByUserId: admin.id,
  });

  revalidatePath("/admin/users");
};

export const rejectUserAction = async (formData: FormData) => {
  const admin = await requireAdmin();

  await setUserApprovalStatus({
    userId: parseUserId(formData),
    status: "rejected",
    reviewedByUserId: admin.id,
  });

  revalidatePath("/admin/users");
};

export const updateUserRoleAction = async (formData: FormData) => {
  const admin = await requireAdmin();
  const userId = parseUserId(formData);
  const role = String(formData.get("role") ?? "") as UserRole;
  const allowedRoles: UserRole[] = ["admin", "moderator", "user"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  if (userId === admin.id && role !== "admin") {
    redirect("/admin/users?error=self-demote");
  }

  await setUserRole({
    userId,
    role,
    reviewedByUserId: admin.id,
  });

  revalidatePath("/admin/users");
};

export const deleteUserAction = async (formData: FormData) => {
  const admin = await requireAdmin();
  const userId = parseUserId(formData);

  if (userId === admin.id) {
    redirect("/admin/users?error=self-delete");
  }

  await deleteUserAndContent(userId);

  revalidatePath("/admin/users");
};

export type AdminUserActionStatus = UserApprovalStatus;
