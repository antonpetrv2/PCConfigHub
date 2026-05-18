import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

export type UserRole = "admin" | "moderator" | "user";
export type UserApprovalStatus = "pending" | "approved" | "rejected";

export const hasAdminUser = async () => {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  return Boolean(admin);
};

export const createAdminUser = async (data: {
  email: string;
  passwordHash: string;
  displayName: string;
}) => {
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: data.passwordHash,
      displayName: data.displayName,
      role: "admin",
      approvalStatus: "approved",
      approvedAt: new Date(),
    })
    .returning({ id: users.id });

  return user;
};

export const listUsersForAdmin = async () => {
  return db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      approvalStatus: users.approvalStatus,
      createdAt: users.createdAt,
      approvedAt: users.approvedAt,
      rejectedAt: users.rejectedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
};

export const setUserApprovalStatus = async (data: {
  userId: number;
  status: UserApprovalStatus;
  reviewedByUserId: number;
}) => {
  await db
    .update(users)
    .set({
      approvalStatus: data.status,
      approvedByUserId:
        data.status === "approved" ? data.reviewedByUserId : null,
      approvedAt: data.status === "approved" ? new Date() : null,
      rejectedAt: data.status === "rejected" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, data.userId));
};

export const setUserRole = async (data: {
  userId: number;
  role: UserRole;
  reviewedByUserId: number;
}) => {
  await db
    .update(users)
    .set({
      role: data.role,
      roleReviewedByUserId: data.reviewedByUserId,
      roleReviewedAt: new Date(),
      roleRequestStatus: "approved",
      updatedAt: new Date(),
    })
    .where(eq(users.id, data.userId));
};
