import type { NextRequest } from "next/server";

import { requireUser, requireRole } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { listUsers } from "@/services/api/admin-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!requireRole(user, ["admin"])) {
      return fail("Forbidden", 403);
    }

    const users = await listUsers();
    return ok(users);
  } catch (error) {
    return handleApiError(error);
  }
}
