import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  comments,
  componentImages,
  components,
  pcConfigurationComponents,
  pcConfigurations,
  users,
} from "@/db/schema";
import { deleteObjectByUrl } from "@/services/api/upload-service";

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
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));
};

export const listPendingUsersForModeration = async () => {
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
    .where(and(eq(users.approvalStatus, "pending"), isNull(users.deletedAt)))
    .orderBy(desc(users.createdAt));
};

export const listPendingCommentsForModeration = async () => {
  return db
    .select({
      id: comments.id,
      authorUserId: comments.authorUserId,
      authorEmail: users.email,
      authorName: users.displayName,
      componentId: comments.componentId,
      componentName: components.name,
      configurationId: comments.configurationId,
      configurationName: pcConfigurations.name,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorUserId))
    .leftJoin(components, eq(components.id, comments.componentId))
    .leftJoin(pcConfigurations, eq(pcConfigurations.id, comments.configurationId))
    .where(
      and(
        eq(comments.approvalStatus, "pending"),
        isNull(comments.deletedAt)
      )
    )
    .orderBy(desc(comments.createdAt));
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

export const approveCommentForModeration = async (data: {
  commentId: number;
  reviewerId: number;
}) => {
  await db
    .update(comments)
    .set({
      approvalStatus: "approved",
      approvedByUserId: data.reviewerId,
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, data.commentId));
};

export const deleteCommentForModeration = async (data: {
  commentId: number;
  reviewerId: number;
}) => {
  await db
    .update(comments)
    .set({
      approvalStatus: "rejected",
      approvedByUserId: null,
      rejectedAt: new Date(),
      rejectionReason: `Deleted as spam by reviewer #${data.reviewerId}`,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(comments.id, data.commentId));
};

export const bulkDeleteCommentsForModeration = async (data: {
  commentIds: number[];
  reviewerId: number;
}) => {
  if (!data.commentIds.length) {
    return;
  }

  await db
    .update(comments)
    .set({
      approvalStatus: "rejected",
      approvedByUserId: null,
      rejectedAt: new Date(),
      rejectionReason: `Bulk spam cleanup by reviewer #${data.reviewerId}`,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(inArray(comments.id, data.commentIds));
};

export const deleteUserAndContent = async (userId: number) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return;
  }

  const ownedComponents = await db
    .select({ id: components.id })
    .from(components)
    .where(eq(components.ownerUserId, userId));
  const componentIds = ownedComponents.map((component) => component.id);

  const ownedConfigs = await db
    .select({ id: pcConfigurations.id })
    .from(pcConfigurations)
    .where(eq(pcConfigurations.ownerUserId, userId));
  const configIds = ownedConfigs.map((config) => config.id);

  if (componentIds.length) {
    const imageRows = await db
      .select({ url: componentImages.url })
      .from(componentImages)
      .where(inArray(componentImages.componentId, componentIds));

    for (const row of imageRows) {
      await deleteObjectByUrl(row.url);
    }

    await db
      .delete(componentImages)
      .where(inArray(componentImages.componentId, componentIds));

    await db
      .delete(pcConfigurationComponents)
      .where(inArray(pcConfigurationComponents.componentId, componentIds));
  }

  if (configIds.length) {
    await db
      .delete(pcConfigurationComponents)
      .where(inArray(pcConfigurationComponents.pcConfigurationId, configIds));
  }

  const commentConditions = [eq(comments.authorUserId, userId)];
  if (componentIds.length) {
    commentConditions.push(inArray(comments.componentId, componentIds));
  }
  if (configIds.length) {
    commentConditions.push(inArray(comments.configurationId, configIds));
  }

  await db.delete(comments).where(or(...commentConditions));

  if (componentIds.length) {
    await db
      .update(components)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(inArray(components.id, componentIds));
  }

  if (configIds.length) {
    await db
      .update(pcConfigurations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(inArray(pcConfigurations.id, configIds));
  }

  await db
    .update(users)
    .set({
      email: `deleted-user-${userId}@deleted.local`,
      displayName: "Deleted user",
      approvalStatus: "rejected",
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
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
