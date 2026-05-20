import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { parseForm } from "@/lib/api/parse-form";
import { ok, fail } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { uploadFile } from "@/services/api/upload-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    const formData = await parseForm(request);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new ApiError("Missing file", 422);
    }

    const result = await uploadFile(file);
    return ok({ url: result.url }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
