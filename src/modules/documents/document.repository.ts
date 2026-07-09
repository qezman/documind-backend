import { pool } from "../../db/pool.js";
import type { Document, CreateDocumentInput } from "./document.types.js";

const mapRowToDocument = (row: any): Document => ({
  id: row.id,
  userId: row.user_id,
  filename: row.filename,
  s3Key: row.s3_key,
  mimeType: row.mime_type,
  status: row.status,
  chunkCount: row.chunk_count,
  errorMsg: row.error_msg,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export const findDocumentById = async (
  id: string,
  userId: string,
): Promise<Document | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ? mapRowToDocument(rows[0]) : null;
};

export const insertDocument = async (
  input: CreateDocumentInput,
): Promise<Document> => {
  const { rows } = await pool.query(
    `INSERT INTO documents (user_id, filename, s3_key, mime_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.userId, input.filename, input.s3Key, input.mimeType],
  );
  return mapRowToDocument(rows[0]);
};

export const updateDocumentStatus = async (
  id: string,
  status: Document["status"],
  chunkCount: number | null = null,
  errorMsg: string | null = null,
): Promise<void> => {
  await pool.query(
    `UPDATE documents
     SET status = $1, chunk_count = $2, error_msg = $3, updated_at = now()
     WHERE id = $4`,
    [status, chunkCount, errorMsg, id],
  );
};

export const listDocuments = async (userId: string): Promise<Document[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(mapRowToDocument);
};

export const deleteDocument = async (
  id: string,
  userId: string,
): Promise<Document | null> => {
  const { rows } = await pool.query(
    `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId],
  );
  return rows[0] ? mapRowToDocument(rows[0]) : null;
};
