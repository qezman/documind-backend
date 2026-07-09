export interface CitedChunk {
  sourceNumber: number;
  chunkIndex:   number;
  similarity:   number;
  excerpt:      string;
}

export interface Chat {
  id:         string;
  documentId: string;
  userId:     string;
  question:   string;
  answer:     string;
  chunksUsed: CitedChunk[];
  createdAt:  string;
}

export interface InsertChatInput {
  documentId: string;
  userId:     string;
  question:   string;
  answer:     string;
  chunksUsed: CitedChunk[];
}
