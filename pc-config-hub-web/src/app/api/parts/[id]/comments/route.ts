import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { commentSchema } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { listPartComments, createPartComment } from "@/services/api/comments-service";
import { hasPart } from "@/services/api/comments-targets";

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new ApiError("Invalid id", 400);
  }
  return id;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const partId = parseId(id);
    const exists = await hasPart(partId);
    if (!exists) {
      return fail("Not found", 404);
    }

    const comments = await listPartComments(partId);
    return ok(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const partId = parseId(id);
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    const body = await request.json().catch(() => null);
    const payloadResult = commentSchema.safeParse(body);
    if (!payloadResult.success) {
      throw new ApiError("Validation error", 422, payloadResult.error.flatten());
    }
    const payload = payloadResult.data;
    const exists = await hasPart(partId);
    if (!exists) {
      return fail("Not found", 404);
    }

    await createPartComment({
      partId,
      authorUserId: user.id,
      body: payload.body,
    });

    return ok({ status: "pending" }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
