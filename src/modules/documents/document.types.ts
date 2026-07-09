export type DocumentStatus = "processing" | "ready" | "failed";

export interface Document {
  id: string;
  userId: string;
  filename: string;
  s3Key: string;
  mimeType: string;
  status: DocumentStatus;
  chunkCount: number | null;
  errorMsg: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  userId: string;
  filename: string;
  s3Key: string;
  mimeType: string;
}
