import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
});

export const getUploadPresignedUrl = async (
  key: string,
  mimeType: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

export const getObjectFromS3 = async (key: string): Promise<Buffer> => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("S3 response body is empty");
  }
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
};

export const deleteObjectFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
};
