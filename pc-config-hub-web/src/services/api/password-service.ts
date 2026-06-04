import bcrypt from "bcrypt";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

import { db } from "@/db/client";
import { passwordResetTokens, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const buildResetUrl = (token: string, origin?: string) => {
  const baseUrl = process.env.PASSWORD_RESET_BASE_URL ?? origin;
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(
    token
  )}`;
};

export const requestPasswordReset = async (data: {
  email: string;
  origin?: string;
}) => {
  const email = normalizeEmail(data.email);
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { success: true, resetUrl: null };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id));

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashResetToken(token),
    expiresAt,
  });

  const shouldReturnResetUrl =
    process.env.NODE_ENV !== "production" ||
    process.env.PASSWORD_RESET_LINKS_IN_RESPONSE === "true";

  return {
    success: true,
    resetUrl: shouldReturnResetUrl ? buildResetUrl(token, data.origin) : null,
  };
};

export const resetPassword = async (data: {
  token: string;
  password: string;
}) => {
  const now = new Date();
  const [resetToken] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
    })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashResetToken(data.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!resetToken) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: now })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { success: true };
};

export const changePassword = async (data: {
  userId: number;
  currentPassword: string;
  newPassword: string;
}) => {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(and(eq(users.id, data.userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    throw new ApiError("Unauthorized", 401);
  }

  const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError("Current password is incorrect", 400);
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  return { success: true };
};
