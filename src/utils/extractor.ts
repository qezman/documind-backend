import pdfParse from "pdf-parse";
import mammoth from "mammoth";

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
  switch (mimeType) {
    case "application/pdf": {
      const result = await pdfParse(buffer);
      return result.text.trim();
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
    case "text/plain":
      return buffer.toString("utf-8").trim();
  }
};
