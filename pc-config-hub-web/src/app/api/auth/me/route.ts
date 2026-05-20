import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { fail, ok } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return fail("Unauthorized", 401);
    }

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}
