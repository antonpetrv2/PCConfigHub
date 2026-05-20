import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { handleApiError } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { compatibilitySchema } from "@/lib/api/schemas";
import { checkConfigCompatibility } from "@/services/api/configs-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const payloadResult = compatibilitySchema.safeParse(body);
    if (!payloadResult.success) {
      throw new ApiError("Validation error", 422, payloadResult.error.flatten());
    }

    const result = await checkConfigCompatibility({
      partIds: payloadResult.data.parts,
      userId: user?.id,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
