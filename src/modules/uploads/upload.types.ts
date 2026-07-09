export interface PresignInput {
  filename: string;
  mimeType: string;
}

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  documentId: string;
}
