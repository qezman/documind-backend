import { env } from "../config/env.js";

interface Chunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

const approximateTokens = (text: string): number =>
  Math.ceil(text.split(/\s+/).length / 0.75);

const splitIntoParagraphs = (text: string): string[] =>
  text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

export const chunkText = (text: string): Chunk[] => {
  const { CHUNK_SIZE_TOKENS, CHUNK_OVERLAP_TOKENS } = env;
  const paragraphs = splitIntoParagraphs(text);
  const chunks: Chunk[] = [];

  let buffer = "";
  let bufferTokens = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = approximateTokens(paragraph);

    // If adding this paragraph exceeds the chunk limit, save current buffer and advance
    if (bufferTokens + paragraphTokens > CHUNK_SIZE_TOKENS && buffer) {
      chunks.push({
        content: buffer.trim(),
        chunkIndex: chunkIndex++,
        tokenCount: bufferTokens,
      });

      // Carry overlap into the next chunk
      const words = buffer.split(/\s+/);
      const overlapWords = words.slice(
        -Math.round(CHUNK_OVERLAP_TOKENS * 0.75),
      );
      buffer = overlapWords.join(" ") + "\n\n" + paragraph;
      bufferTokens = approximateTokens(buffer);
    } else {
      buffer = buffer ? buffer + "\n\n" + paragraph : paragraph;
      bufferTokens += paragraphTokens;
    }
  }

  if (buffer.trim()) {
    chunks.push({
      content: buffer.trim(),
      chunkIndex: chunkIndex,
      tokenCount: bufferTokens,
    });
  }

  return chunks;
};
