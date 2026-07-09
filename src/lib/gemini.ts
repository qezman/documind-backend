import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const generateModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Embed a document chunk for storage
export const embedChunk = async (text: string): Promise<number[]> => {
  const result = await embedModel.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
  return result.embedding.values;
};

// Embed a user's question for retrieval
export const embedQuery = async (question: string): Promise<number[]> => {
  const result = await embedModel.embedContent({
    content: { parts: [{ text: question }], role: "user" },
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  return result.embedding.values;
};

// Generate a grounded answer from context chunks
// Returns an async generator for streaming
export const generateAnswer = async function* (
  question: string,
  contextChunks: string[],
): AsyncGenerator<string> {
  const context = contextChunks
    .map((chunk, i) => `[Source ${i + 1}]\n${chunk}`)
    .join("\n\n---\n\n");

  const prompt = [
    "You are a precise document assistant. Answer the question using ONLY",
    "the provided source excerpts. If the answer is not in the sources,",
    "say so clearly. Cite sources by their [Source N] number.",
    "",
    `Sources:\n${context}`,
    "",
    `Question: ${question}`,
  ].join("\n");

  const stream = await generateModel.generateContentStream(prompt);
  for await (const chunk of stream.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
};
