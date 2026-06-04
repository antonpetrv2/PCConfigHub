import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api/handler";
import { parseJson } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { resetPasswordSchema } from "@/lib/api/schemas";
import { resetPassword } from "@/services/api/password-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, resetPasswordSchema);
    const result = await resetPassword(payload);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
