import dotenv from "dotenv";
import path from "path";

dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  AWS_REGION: required("AWS_REGION"),
  AWS_S3_BUCKET_NAME: required("AWS_S3_BUCKET_NAME"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  PORT: parseInt(optional("PORT", "3002"), 10),
  MAX_UPLOAD_SIZE_MB: parseInt(optional("MAX_UPLOAD_SIZE_MB", "20"), 10),
  CHUNK_SIZE_TOKENS: parseInt(optional("CHUNK_SIZE_TOKENS", "400"), 10),
  CHUNK_OVERLAP_TOKENS: parseInt(optional("CHUNK_OVERLAP_TOKENS", "50"), 10),
  SIMILARITY_THRESHOLD: parseFloat(optional("SIMILARITY_THRESHOLD", "0.65")),
  TOP_K_CHUNKS: parseInt(optional("TOP_K_CHUNKS", "5"), 10),
} as const;
