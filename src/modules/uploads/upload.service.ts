import { getUploadPresignedUrl } from "../../lib/s3.js";
import { isSupportedMime } from "../../utils/extractor.js";
import { AppError } from "../../utils/errors.js";
import { env } from "../../config/env.js";
import type { PresignResponse } from "./upload.types.js";

export const createPresignedUpload = async (
  userId: string,
  filename: string,
  mimeType: string,
): Promise<PresignResponse> => {
  if (!isSupportedMime(mimeType)) {
    throw new AppError(`Unsupported file type: ${mimeType}`, 422);
  }

  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `documind/${userId}/${Date.now()}-${sanitized}`;
  const uploadUrl = await getUploadPresignedUrl(key, mimeType);

  return { uploadUrl, key, documentId: "" };
};
