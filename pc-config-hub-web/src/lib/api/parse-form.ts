import { ApiError } from "@/lib/api/errors";

export const parseForm = async (request: Request) => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new ApiError("Expected multipart/form-data", 415);
  }

  return request.formData();
};
