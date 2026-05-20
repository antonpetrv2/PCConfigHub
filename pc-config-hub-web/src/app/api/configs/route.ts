import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { buildMeta } from "@/lib/api/meta";
import { ok, fail } from "@/lib/api/response";
import { configSchema } from "@/lib/api/schemas";
import { getPagination } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { listConfigs, createConfig } from "@/services/api/configs-service";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pagination = getPagination(url);
    const user = await requireUser(request);

    const { configs, total } = await listConfigs({
      userId: user?.id,
      page: pagination.page,
      limit: pagination.limit,
    });

    return ok(configs, buildMeta(total, pagination.page, pagination.limit));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    const body = await request.json().catch(() => null);
    const payloadResult = configSchema.safeParse(body);
    if (!payloadResult.success) {
      throw new ApiError("Validation error", 422, payloadResult.error.flatten());
    }
    const payload = payloadResult.data;

    const result = await createConfig({
      userId: user.id,
      userRole: user.role,
      name: payload.name,
      description: payload.description,
      visibility: payload.visibility,
      partIds: payload.parts,
    });

    return ok(result, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
