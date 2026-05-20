import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { compatibilitySchema } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { checkConfigCompatibility } from "@/services/api/configs-service";

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
    const { id } = await context.params;
    parseId(id);
    const user = await requireUser(request);

    const body = await request.json().catch(() => null);
    const payloadResult = compatibilitySchema.safeParse(body);
    if (!payloadResult.success) {
      throw new ApiError("Validation error", 422, payloadResult.error.flatten());
    }
    const payload = payloadResult.data;

    const result = await checkConfigCompatibility({
      partIds: payload.parts,
      userId: user?.id,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
