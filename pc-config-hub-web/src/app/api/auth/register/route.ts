import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api/handler";
import { parseJson } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { registerSchema } from "@/lib/api/schemas";
import { setAuthCookie } from "@/lib/api/cookies";
import { registerUser } from "@/services/api/auth-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJson(request, registerSchema);
    const result = await registerUser(payload);
    await setAuthCookie(result.token);
    return ok(result, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
