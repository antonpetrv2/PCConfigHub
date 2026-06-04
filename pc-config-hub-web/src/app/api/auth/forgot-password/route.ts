import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api/handler";
import { parseJson } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { forgotPasswordSchema } from "@/lib/api/schemas";
import { requestPasswordReset } from "@/services/api/password-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, forgotPasswordSchema);
    const result = await requestPasswordReset({
      ...payload,
      origin: request.nextUrl.origin,
    });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
