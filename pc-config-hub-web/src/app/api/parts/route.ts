import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { buildMeta } from "@/lib/api/meta";
import { parseForm } from "@/lib/api/parse-form";
import { ok, fail } from "@/lib/api/response";
import {
  caseSpecSchema,
  cpuSpecSchema,
  gpuSpecSchema,
  motherboardSpecSchema,
  partBaseSchema,
  partCategorySchema,
  psuSpecSchema,
  ramSpecSchema,
  soundcardSpecSchema,
  storageSpecSchema,
} from "@/lib/api/schemas";
import { getPagination } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { listParts, createPart } from "@/services/api/parts-service";
import { uploadFile } from "@/services/api/upload-service";

export const runtime = "nodejs";

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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pagination = getPagination(url);
    const categoryParam = url.searchParams.get("category") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;

    const categoryResult = categoryParam
      ? partCategorySchema.safeParse(categoryParam)
      : null;
    if (categoryResult && !categoryResult.success) {
      throw new ApiError("Validation error", 422, categoryResult.error.flatten());
    }
    const category = categoryResult?.success ? categoryResult.data : undefined;

    const user = await requireUser(request);
    const { parts, total } = await listParts({
      userId: user?.id,
      category,
      search,
      page: pagination.page,
      limit: pagination.limit,
    });

    return ok(parts, buildMeta(total, pagination.page, pagination.limit));
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

    const formData = await parseForm(request);
    const payloadRaw = formData.get("payload");
    if (!payloadRaw || typeof payloadRaw !== "string") {
      throw new ApiError("Missing payload", 422);
    }

    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const baseResult = partBaseSchema.safeParse(payload);
    if (!baseResult.success) {
      throw new ApiError("Validation error", 422, baseResult.error.flatten());
    }
    const base = baseResult.data;
    const specs = parseSpecs(base.category, payload.specs);

    const imageFile = formData.get("image");
    const imageUrlFromPayload =
      typeof payload.imageUrl === "string" ? payload.imageUrl : null;

    const imageUrl =
      imageFile instanceof File && imageFile.size > 0
        ? (await uploadFile(imageFile)).url
        : imageUrlFromPayload;

    const id = await createPart({
      userId: user.id,
      userRole: user.role,
      category: base.category,
      name: base.name,
      manufacturer: base.manufacturer,
      model: base.model,
      description: base.description,
      visibility: base.visibility,
      specs,
      imageUrl,
    });

    return ok({ id }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
