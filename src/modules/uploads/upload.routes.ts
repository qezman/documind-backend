import type { FastifyInstance } from "fastify";
import { authenticate } from "../../plugins/authenticate.js";
import { createPresignedUpload } from "./upload.service.js";

export const uploadRoutes = async (app: FastifyInstance): Promise<void> => {
  app.addHook("preHandler", authenticate);

  app.post("/presign", async (req, reply) => {
    const { filename, mimeType } = req.body as {
      filename: string;
      mimeType: string;
    };
    if (!filename || !mimeType) {
      return reply
        .status(400)
        .send({ message: "filename and mimeType are required" });
    }
    const result = await createPresignedUpload(req.user.id, filename, mimeType);
    return reply.status(200).send(result);
  });
};
