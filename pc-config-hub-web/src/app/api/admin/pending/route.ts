import type { NextRequest } from "next/server";

import { requireUser, requireRole } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/response";
import { listPendingItems } from "@/services/api/admin-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!requireRole(user, ["admin", "moderator"])) {
      return fail("Forbidden", 403);
    }

    const pending = await listPendingItems();
    return ok(pending);
  } catch (error) {
    return handleApiError(error);
  }
}
