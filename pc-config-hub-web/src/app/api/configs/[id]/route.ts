import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { configSchema } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { getConfigById, updateConfig, deleteConfig } from "@/services/api/configs-service";

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new ApiError("Invalid id", 400);
  }
  return id;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const configId = parseId(id);
    const user = await requireUser(request);
    const config = await getConfigById(configId, user?.id);

    if (!config) {
      return fail("Not found", 404);
    }

    return ok(config);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const configId = parseId(id);
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

    const result = await updateConfig({
      configId,
      userId: user.id,
      userRole: user.role,
      name: payload.name,
      description: payload.description,
      visibility: payload.visibility,
      partIds: payload.parts,
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const configId = parseId(id);
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    await deleteConfig({ configId, userId: user.id });
    return ok({ id: configId });
  } catch (error) {
    return handleApiError(error);
  }
}
