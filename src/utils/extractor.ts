import pdfParse from "pdf-parse";
import mammoth from "mammoth";

import { AppError } from "./errors.js";

export type SupportedMime =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

const SUPPORTED_MIMES = new Set<string>([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const isSupportedMime = (mime: string): mime is SupportedMime =>
  SUPPORTED_MIMES.has(mime);

export const extractText = async (
  buffer: Buffer,
  mimeType: SupportedMime,
): Promise<string> => {
  if (!buffer || buffer.length === 0) {
    throw new AppError("Uploaded file is empty (0 bytes)", 422);
  }

  let text = "";

  try {
    switch (mimeType) {
      case "application/pdf": {
        const result = await pdfParse(buffer);
        text = result.text || "";
        break;
      }
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
        break;
      }
      case "text/plain": {
        text = buffer.toString("utf-8");
        break;
      }
    }
  } catch (err: any) {
    throw new AppError(
      `Failed to parse document: ${err.message || String(err)}`,
      422,
    );
  }

  // Clean null bytes and invalid control characters that PostgreSQL and vector store reject
  const cleanedText = text
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .trim();

  if (!cleanedText) {
    throw new AppError(
      "No readable text found in document. If this is a scanned PDF or image, plain text or OCR is required.",
      422,
    );
  }

  return cleanedText;
};
