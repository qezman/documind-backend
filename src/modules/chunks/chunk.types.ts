export interface CreateChunkInput {
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  embedding: number[];
}

export interface RetrievedChunk {
  chunkIndex: number;
  content: string;
  similarity: number;
}
