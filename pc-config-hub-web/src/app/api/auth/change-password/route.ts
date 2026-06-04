import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { parseJson } from "@/lib/api/parse";
import { fail, ok } from "@/lib/api/response";
import { changePasswordSchema } from "@/lib/api/schemas";
import { changePassword } from "@/services/api/password-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    const payload = await parseJson(request, changePasswordSchema);
    const result = await changePassword({ ...payload, userId: user.id });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
