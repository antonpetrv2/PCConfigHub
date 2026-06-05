import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { buildMeta } from "@/lib/api/meta";
import { parseForm } from "@/lib/api/parse-form";
import { ok, fail } from "@/lib/api/response";
import { conditionSchema, partBaseSchema, partCategorySchema } from "@/lib/api/schemas";
import { getPagination } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { listParts, createPart } from "@/services/api/parts-service";
import { uploadFile } from "@/services/api/upload-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pagination = getPagination(url);
    const categoryParam = url.searchParams.get("category") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const conditionParam = url.searchParams.get("condition") ?? undefined;

    const categoryResult = categoryParam
      ? partCategorySchema.safeParse(categoryParam)
      : null;
    if (categoryResult && !categoryResult.success) {
      throw new ApiError("Validation error", 422, categoryResult.error.flatten());
    }
    const category = categoryResult?.success ? categoryResult.data : undefined;
    const conditionResult = conditionParam
      ? conditionSchema.safeParse(conditionParam)
      : null;
    if (conditionResult && !conditionResult.success) {
      throw new ApiError("Validation error", 422, conditionResult.error.flatten());
    }

    const user = await requireUser(request);
    const { parts, total } = await listParts({
      userId: user?.id,
      category,
      search,
      era: url.searchParams.get("era") ?? undefined,
      busType: url.searchParams.get("busType") ?? undefined,
      cpuFamily: url.searchParams.get("cpuFamily") ?? undefined,
      condition: conditionResult?.success ? conditionResult.data : undefined,
      systemType: url.searchParams.get("systemType") ?? undefined,
      tag: url.searchParams.get("tag") ?? undefined,
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
      yearEra: base.yearEra,
      countryOfOrigin: base.countryOfOrigin,
      serialNumber: base.serialNumber,
      inventoryNumber: base.inventoryNumber,
      condition: base.condition,
      description: base.description,
      notes: base.notes,
      tags: base.tags,
      location: base.location,
      acquisitionDate: base.acquisitionDate,
      source: base.source,
      purchasePrice: base.purchasePrice,
      estimatedValue: base.estimatedValue,
      relatedConfigurationId: base.relatedConfigurationId,
      visibility: base.visibility,
      specs: base.specs,
      customFields: base.customFields,
      testLogs: base.testLogs,
      restorationLogs: base.restorationLogs,
      imageUrl,
    });

    return ok({ id }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
