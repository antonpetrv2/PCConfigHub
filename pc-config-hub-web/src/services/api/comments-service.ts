import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { comments, users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

export const listPartComments = async (partId: number) => {
  return db
    .select({
      id: comments.id,
      authorUserId: comments.authorUserId,
      authorName: users.displayName,
      authorEmail: users.email,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorUserId))
    .where(
      and(
        eq(comments.componentId, partId),
        eq(comments.approvalStatus, "approved"),
        isNull(comments.deletedAt)
      )
    )
    .orderBy(comments.createdAt);
};

export const listConfigComments = async (configId: number) => {
  return db
    .select({
      id: comments.id,
      authorUserId: comments.authorUserId,
      authorName: users.displayName,
      authorEmail: users.email,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorUserId))
    .where(
      and(
        eq(comments.configurationId, configId),
        eq(comments.approvalStatus, "approved"),
        isNull(comments.deletedAt)
      )
    )
    .orderBy(comments.createdAt);
};

export const createPartComment = async (data: {
  partId: number;
  authorUserId: number;
  body: string;
}) => {
  await db.insert(comments).values({
    authorUserId: data.authorUserId,
    componentId: data.partId,
    body: data.body,
    approvalStatus: "pending",
  });
};

export const createConfigComment = async (data: {
  configId: number;
  authorUserId: number;
  body: string;
}) => {
  await db.insert(comments).values({
    authorUserId: data.authorUserId,
    configurationId: data.configId,
    body: data.body,
    approvalStatus: "pending",
  });
};

export const ensureCommentTarget = (partId?: number, configId?: number) => {
  if (!partId && !configId) {
    throw new ApiError("Comment target not found", 404);
  }
};
