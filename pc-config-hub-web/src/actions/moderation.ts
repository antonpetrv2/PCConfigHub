"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  approveCommentForModeration,
  bulkDeleteCommentsForModeration,
  deleteCommentForModeration,
  setUserApprovalStatus,
} from "@/services/admin-service";

const requireModerator = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/moderator");
  }

  if (user.role !== "admin" && user.role !== "moderator") {
    redirect("/");
  }

  return user;
};

const parsePositiveId = (value: FormDataEntryValue | null) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }

  return id;
};

export const moderatorApproveUserAction = async (formData: FormData) => {
  const reviewer = await requireModerator();

  await setUserApprovalStatus({
    userId: parsePositiveId(formData.get("userId")),
    status: "approved",
    reviewedByUserId: reviewer.id,
  });

  revalidatePath("/moderator");
};

export const moderatorRejectUserAction = async (formData: FormData) => {
  const reviewer = await requireModerator();

  await setUserApprovalStatus({
    userId: parsePositiveId(formData.get("userId")),
    status: "rejected",
    reviewedByUserId: reviewer.id,
  });

  revalidatePath("/moderator");
};

export const moderatorApproveCommentAction = async (formData: FormData) => {
  const reviewer = await requireModerator();

  await approveCommentForModeration({
    commentId: parsePositiveId(formData.get("commentId")),
    reviewerId: reviewer.id,
  });

  revalidatePath("/moderator");
};

export const moderatorDeleteCommentAction = async (formData: FormData) => {
  const reviewer = await requireModerator();

  await deleteCommentForModeration({
    commentId: parsePositiveId(formData.get("commentId")),
    reviewerId: reviewer.id,
  });

  revalidatePath("/moderator");
};

export const moderatorBulkDeleteCommentsAction = async (formData: FormData) => {
  const reviewer = await requireModerator();
  const commentIds = formData
    .getAll("commentIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!commentIds.length) {
    redirect("/moderator?error=no-comments-selected");
  }

  await bulkDeleteCommentsForModeration({
    commentIds,
    reviewerId: reviewer.id,
  });

  revalidatePath("/moderator");
};
