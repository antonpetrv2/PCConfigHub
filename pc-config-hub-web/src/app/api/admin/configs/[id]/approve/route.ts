import type { NextRequest } from "next/server";

import { requireUser, requireRole } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { approveConfig } from "@/services/api/admin-service";

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

    const { id } = await context.params;
    const configId = parseId(id);
    await approveConfig(configId, user!.id);
    return ok({ id: configId });
  } catch (error) {
    return handleApiError(error);
  }
}
