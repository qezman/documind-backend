import { getUploadPresignedUrl, deleteObjectFromS3 } from '../../lib/s3.js';
import { isSupportedMime } from '../../utils/extractor.js';
import { AppError, NotFoundError } from '../../utils/errors.js';
import {
  insertDocument,
  findDocumentById,
  updateDocumentStatus,
  listDocuments as listRepoDocuments,
  deleteDocument as deleteRepoDocument,
} from './document.repository.js';
import { processDocumentIntoChunks } from '../chunks/chunk.service.js';
import type { Document } from './document.types.js';

export const uploadDocument = async (
  userId: string,
  filename: string,
  mimeType: string
) => {
  if (!isSupportedMime(mimeType)) {
    throw new AppError(`Unsupported file type: ${mimeType}`, 422);
  }

  // Use documind/ prefix as specified in the infra reuse map
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const s3Key = `documind/${userId}/${Date.now()}-${sanitizedFilename}`;

  const uploadUrl = await getUploadPresignedUrl(s3Key, mimeType);

  const doc = await insertDocument({
    userId,
    filename,
    s3Key,
    mimeType,
  });

  return {
    uploadUrl,
    key: s3Key,
    documentId: doc.id,
  };
};

export const processDocument = async (
  userId: string,
  id: string
): Promise<void> => {
  const doc = await findDocumentById(id, userId);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  // Trigger text extraction + embedding pipeline asynchronously in the background
  // Update document status based on outcome
  processDocumentIntoChunks(doc.id, doc.s3Key, doc.mimeType)
    .then(async (chunkCount) => {
      await updateDocumentStatus(doc.id, 'ready', chunkCount);
    })
    .catch(async (err) => {
      console.error(`Error processing document ${doc.id}:`, err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      await updateDocumentStatus(doc.id, 'failed', null, errorMsg.slice(0, 500));
    });
};

export const listDocuments = async (userId: string): Promise<Document[]> => {
  return listRepoDocuments(userId);
};

export const deleteDocument = async (
  userId: string,
  id: string
): Promise<void> => {
  const doc = await findDocumentById(id, userId);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  // Delete from DB first
  await deleteRepoDocument(id, userId);

  // Delete from S3
  try {
    await deleteObjectFromS3(doc.s3Key);
  } catch (err) {
    console.error(`Failed to delete S3 object ${doc.s3Key}:`, err);
    // Non-blocking: continue even if S3 delete fails
  }
};
