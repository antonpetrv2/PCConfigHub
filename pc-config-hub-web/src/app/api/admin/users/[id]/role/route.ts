import type { NextRequest } from "next/server";

import { requireUser, requireRole } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { roleSchema } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { updateUserRole } from "@/services/api/admin-service";

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new ApiError("Invalid id", 400);
  }
  return id;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!requireRole(user, ["admin"])) {
      return fail("Forbidden", 403);
    }

    const body = await request.json().catch(() => null);
    const payloadResult = roleSchema.safeParse(body?.role ?? body);
    if (!payloadResult.success) {
      throw new ApiError("Validation error", 422, payloadResult.error.flatten());
    }
    const payload = payloadResult.data;

    const { id } = await context.params;
    const targetId = parseId(id);
    await updateUserRole(targetId, payload, user!.id);
    return ok({ id: targetId, role: payload });
  } catch (error) {
    return handleApiError(error);
  }
}
