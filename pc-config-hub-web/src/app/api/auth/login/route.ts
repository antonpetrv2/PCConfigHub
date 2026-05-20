import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api/handler";
import { parseJson } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { loginSchema } from "@/lib/api/schemas";
import { setAuthCookie } from "@/lib/api/cookies";
import { loginUser } from "@/services/api/auth-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, loginSchema);
    const result = await loginUser(payload);
    await setAuthCookie(result.token);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
