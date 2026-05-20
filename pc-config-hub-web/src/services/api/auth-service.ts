import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { signAuthToken } from "@/lib/jwt";

export type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "moderator" | "user";
};

const toApiUser = (user: {
  id: number;
  email: string;
  displayName: string | null;
  role: "admin" | "moderator" | "user";
}) => ({
  id: user.id,
  email: user.email,
  name: user.displayName ?? user.email,
  role: user.role,
});

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing) {
    throw new ApiError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      displayName: data.name,
      role: "user",
      approvalStatus: "approved",
      approvedAt: new Date(),
    })
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
    });

  const apiUser = toApiUser(user);
  const token = await signAuthToken({
    sub: String(apiUser.id),
    email: apiUser.email,
    role: apiUser.role,
    name: apiUser.name,
  });

  return { token, user: apiUser };
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      approvalStatus: users.approvalStatus,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  if (user.approvalStatus !== "approved") {
    throw new ApiError("Account pending approval", 403);
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError("Invalid credentials", 401);
  }

  const apiUser = toApiUser(user);
  const token = await signAuthToken({
    sub: String(apiUser.id),
    email: apiUser.email,
    role: apiUser.role,
    name: apiUser.name,
  });

  return { token, user: apiUser };
};
