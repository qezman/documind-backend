import { embedQuery, generateAnswer } from "../../lib/gemini.js";
import { findSimilarChunks } from "../chunks/chunk.repository.js";
import {
  insertChat,
  getChatHistory as getRepoChatHistory,
} from "./chat.repository.js";
import { findDocumentById } from "../documents/document.repository.js";
import { NotFoundError, AppError } from "../../utils/errors.js";
import { env } from "../../config/env.js";
import type { CitedChunk, Chat } from "./chat.types.js";

interface AskDocumentInput {
  userId: string;
  documentId: string;
  question: string;
  onToken: (token: string) => void;
  onComplete: (chatId: string, chunks: CitedChunk[]) => void;
}

export const askDocument = async ({
  userId,
  documentId,
  question,
  onToken,
  onComplete,
}: AskDocumentInput): Promise<void> => {
  const doc = await findDocumentById(documentId, userId);
  if (!doc) throw new NotFoundError("Document not found");
  if (doc.status !== "ready")
    throw new AppError("Document is still processing", 409);

  const queryEmbedding = await embedQuery(question);

  const chunks = await findSimilarChunks(
    documentId,
    queryEmbedding,
    env.TOP_K_CHUNKS,
    env.SIMILARITY_THRESHOLD,
  );

  if (chunks.length === 0) {
    const text =
      "I couldn't find relevant information in this document to answer your question.";
    onToken(text);
    const chatId = await insertChat({
      documentId,
      userId,
      question,
      answer: text,
      chunksUsed: [],
    });
    onComplete(chatId, []);
    return;
  }

  let fullAnswer = "";
  const contextTexts = chunks.map((c) => c.content);

  for await (const token of generateAnswer(question, contextTexts)) {
    fullAnswer += token;
    onToken(token);
  }

  const citedChunks: CitedChunk[] = chunks.map((c, i) => ({
    sourceNumber: i + 1,
    chunkIndex: c.chunkIndex,
    similarity: c.similarity,
    excerpt: c.content.slice(0, 200) + (c.content.length > 200 ? "…" : ""),
  }));

  const chatId = await insertChat({
    documentId,
    userId,
    question,
    answer: fullAnswer,
    chunksUsed: citedChunks,
  });

  onComplete(chatId, citedChunks);
};

export const getChatHistory = async (
  userId: string,
  documentId: string,
): Promise<Chat[]> => {
  return getRepoChatHistory(userId, documentId);
};
