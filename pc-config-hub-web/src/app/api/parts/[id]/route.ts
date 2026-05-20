import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import {
  caseSpecSchema,
  cpuSpecSchema,
  gpuSpecSchema,
  motherboardSpecSchema,
  partBaseSchema,
  psuSpecSchema,
  ramSpecSchema,
  soundcardSpecSchema,
  storageSpecSchema,
} from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { getPartById, updatePart, deletePart } from "@/services/api/parts-service";

const parseSpecs = (category: string, specs: unknown) => {
  const schema =
    category === "motherboard"
      ? motherboardSpecSchema
      : category === "cpu"
        ? cpuSpecSchema
        : category === "gpu"
          ? gpuSpecSchema
          : category === "ram"
            ? ramSpecSchema
            : category === "psu"
              ? psuSpecSchema
              : category === "case"
                ? caseSpecSchema
                : category === "storage"
                  ? storageSpecSchema
                  : category === "soundcard"
                    ? soundcardSpecSchema
                    : null;

  if (!schema) {
    throw new ApiError("Invalid category", 422);
  }

  const result = schema.safeParse(specs);
  if (!result.success) {
    throw new ApiError("Validation error", 422, result.error.flatten());
  }

  return result.data;
};

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
    const partId = parseId(id);
    const user = await requireUser(request);
    const part = await getPartById(partId, user?.id);

    if (!part) {
      return fail("Not found", 404);
    }

    return ok(part);
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
    const partId = parseId(id);
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    const body = await request.json().catch(() => null);
    const baseResult = partBaseSchema.safeParse(body);
    if (!baseResult.success) {
      throw new ApiError("Validation error", 422, baseResult.error.flatten());
    }
    const base = baseResult.data;
    const specs = parseSpecs(base.category, body?.specs);

    await updatePart({
      partId,
      userId: user.id,
      userRole: user.role,
      category: base.category,
      name: base.name,
      manufacturer: base.manufacturer,
      model: base.model,
      description: base.description,
      visibility: base.visibility,
      specs,
    });

    return ok({ id: partId });
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
    const partId = parseId(id);
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    await deletePart({ partId, userId: user.id });
    return ok({ id: partId });
  } catch (error) {
    return handleApiError(error);
  }
}
