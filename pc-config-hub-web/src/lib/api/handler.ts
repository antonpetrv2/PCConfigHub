import { ApiError } from "@/lib/api/errors";
import { fail } from "@/lib/api/response";

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return fail(error.message, error.status, error.details);
  }

  if (process.env.NODE_ENV !== "production") {
    // Surface safe error info during development.
    console.error("API error", error);
    if (error instanceof Error) {
      return fail("Internal server error", 500, { message: error.message });
    }
  }

  return fail("Internal server error", 500);
};
