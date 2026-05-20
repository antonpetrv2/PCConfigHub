import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { comments, components, pcConfigurations, users } from "@/db/schema";

export const listPendingItems = async () => {
  const pendingParts = await db
    .select({
      id: components.id,
      name: components.name,
      ownerUserId: components.ownerUserId,
      visibility: components.visibility,
      createdAt: components.createdAt,
    })
    .from(components)
    .where(
      and(
        eq(components.approvalStatus, "pending"),
        isNull(components.deletedAt)
      )
    )
    .orderBy(desc(components.createdAt));

  const pendingConfigs = await db
    .select({
      id: pcConfigurations.id,
      name: pcConfigurations.name,
      ownerUserId: pcConfigurations.ownerUserId,
      visibility: pcConfigurations.visibility,
      createdAt: pcConfigurations.createdAt,
    })
    .from(pcConfigurations)
    .where(
      and(
        eq(pcConfigurations.approvalStatus, "pending"),
        isNull(pcConfigurations.deletedAt)
      )
    )
    .orderBy(desc(pcConfigurations.createdAt));

  const pendingComments = await db
    .select({
      id: comments.id,
      authorUserId: comments.authorUserId,
      componentId: comments.componentId,
      configurationId: comments.configurationId,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(
      and(
        eq(comments.approvalStatus, "pending"),
        isNull(comments.deletedAt)
      )
    )
    .orderBy(desc(comments.createdAt));

  return {
    parts: pendingParts,
    configs: pendingConfigs,
    comments: pendingComments,
  };
};

export const approvePart = async (id: number, reviewerId: number) => {
  await db
    .update(components)
    .set({
      approvalStatus: "approved",
      approvedByUserId: reviewerId,
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(components.id, id));
};

export const rejectPart = async (
  id: number,
  reviewerId: number,
  reason?: string
) => {
  await db
    .update(components)
    .set({
      approvalStatus: "rejected",
      approvedByUserId: null,
      approvedAt: null,
      rejectedAt: new Date(),
      rejectionReason: reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(components.id, id));
};

export const approveConfig = async (id: number, reviewerId: number) => {
  await db
    .update(pcConfigurations)
    .set({
      approvalStatus: "approved",
      approvedByUserId: reviewerId,
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(pcConfigurations.id, id));
};

export const rejectConfig = async (
  id: number,
  reviewerId: number,
  reason?: string
) => {
  await db
    .update(pcConfigurations)
    .set({
      approvalStatus: "rejected",
      approvedByUserId: null,
      approvedAt: null,
      rejectedAt: new Date(),
      rejectionReason: reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pcConfigurations.id, id));
};

export const approveComment = async (id: number, reviewerId: number) => {
  await db
    .update(comments)
    .set({
      approvalStatus: "approved",
      approvedByUserId: reviewerId,
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id));
};

export const rejectComment = async (
  id: number,
  reviewerId: number,
  reason?: string
) => {
  await db
    .update(comments)
    .set({
      approvalStatus: "rejected",
      approvedByUserId: null,
      approvedAt: null,
      rejectedAt: new Date(),
      rejectionReason: reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id));
};

export const listUsers = async () => {
  return db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      approvalStatus: users.approvalStatus,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
};

export const updateUserRole = async (
  userId: number,
  role: "admin" | "moderator" | "user",
  reviewerId: number
) => {
  await db
    .update(users)
    .set({
      role,
      roleReviewedByUserId: reviewerId,
      roleReviewedAt: new Date(),
      roleRequestStatus: "approved",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
};
