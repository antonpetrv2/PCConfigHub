import type { ZodSchema } from "zod";

import { ApiError } from "@/lib/api/errors";

export const parseJson = async <T>(request: Request, schema: ZodSchema<T>) => {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError("Validation error", 422, result.error.flatten());
  }
  return result.data;
};
