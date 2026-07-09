import { getObjectFromS3 } from '../../lib/s3.js';
import { embedChunk } from '../../lib/gemini.js';
import { extractText, isSupportedMime } from '../../utils/extractor.js';
import { chunkText } from '../../utils/chunker.js';
import { insertChunks, deleteChunksByDocumentId } from './chunk.repository.js';
import { AppError } from '../../utils/errors.js';
import type { SupportedMime } from '../../utils/extractor.js';

export const processDocumentIntoChunks = async (
  documentId: string,
  s3Key: string,
  mimeType: string
): Promise<number> => {
  if (!isSupportedMime(mimeType)) {
    throw new AppError(`Unsupported file type: ${mimeType}`, 422);
  }

  const buffer = await getObjectFromS3(s3Key);
  const rawText = await extractText(buffer, mimeType as SupportedMime);

  if (!rawText.trim()) {
    throw new AppError('Document appears to be empty or unreadable', 422);
  }

  const chunks = chunkText(rawText);

  // Embed each chunk — sequential to respect Gemini rate limits (Rule 9)
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const emb = await embedChunk(chunk.content);
    embeddings.push(emb);
    if (chunks.length > 50) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  await deleteChunksByDocumentId(documentId);

  await insertChunks(
    chunks.map((chunk, i) => ({
      documentId,
      content:    chunk.content,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      embedding:  embeddings[i],
    }))
  );

  return chunks.length;
};
