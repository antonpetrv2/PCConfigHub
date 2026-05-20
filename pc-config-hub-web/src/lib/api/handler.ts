import { ApiError } from "@/lib/api/errors";
import { fail } from "@/lib/api/response";

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return fail(error.message, error.status, error.details);
  }

  return fail("Internal server error", 500);
};
