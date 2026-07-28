import { pool } from "../../db/pool.js";
import type { RetrievedChunk, CreateChunkInput } from "./chunk.types.js";

export const insertChunks = async (
  chunks: CreateChunkInput[],
): Promise<void> => {
  if (chunks.length === 0) return;

  // one round trip for all chunks
  const values = chunks
    .map((_, i) => {
      const base = i * 5;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::vector)`;
    })
    .join(", ");

  const params = chunks.flatMap((c) => [
    c.documentId,
    c.content,
    c.chunkIndex,
    c.tokenCount,
    `[${c.embedding.join(",")}]`,
  ]);

  await pool.query(
    `INSERT INTO document_chunks
     (document_id, content, chunk_index, token_count, embedding)
     VALUES ${values}`,
    params,
  );
};

export const findSimilarChunks = async (
  documentId: string,
  queryEmbedding: number[],
  limit: number,
  threshold: number,
): Promise<RetrievedChunk[]> => {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const { rows } = await pool.query<RetrievedChunk>(
    `SELECT
       chunk_index AS "chunkIndex",
       content,
       1 - (embedding <=> $1::vector) AS similarity
     FROM document_chunks
     WHERE document_id = $2
       AND 1 - (embedding <=> $1::vector) >= $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    [vectorLiteral, documentId, threshold, limit],
  );

  return rows;
};

export const deleteChunksByDocumentId = async (
  documentId: string,
): Promise<void> => {
  await pool.query("DELETE FROM document_chunks WHERE document_id = $1", [
    documentId,
  ]);
};
