import type { NextRequest } from "next/server";

import { requireUser, requireRole } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { rejectComment } from "@/services/api/admin-service";

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new ApiError("Invalid id", 400);
  }
  return id;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!requireRole(user, ["admin", "moderator"])) {
      return fail("Forbidden", 403);
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : undefined;

    const { id } = await context.params;
    const commentId = parseId(id);
    await rejectComment(commentId, user!.id, reason);
    return ok({ id: commentId });
  } catch (error) {
    return handleApiError(error);
  }
}
