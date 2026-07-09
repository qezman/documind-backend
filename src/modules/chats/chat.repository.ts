import { pool } from '../../db/pool.js';
import type { Chat, InsertChatInput } from './chat.types.js';

const mapRowToChat = (row: any): Chat => ({
  id:         row.id,
  documentId: row.document_id,
  userId:     row.user_id,
  question:   row.question,
  answer:     row.answer,
  chunksUsed: row.chunks_used ?? [],
  createdAt:  row.created_at.toISOString(),
});

export const insertChat = async (input: InsertChatInput): Promise<string> => {
  const { rows } = await pool.query(
    `INSERT INTO chats (document_id, user_id, question, answer, chunks_used)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.documentId,
      input.userId,
      input.question,
      input.answer,
      JSON.stringify(input.chunksUsed),
    ]
  );
  return rows[0].id;
};

export const getChatHistory = async (
  userId: string,
  documentId: string
): Promise<Chat[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM chats
     WHERE user_id = $1 AND document_id = $2
     ORDER BY created_at ASC`,
    [userId, documentId]
  );
  return rows.map(mapRowToChat);
};
