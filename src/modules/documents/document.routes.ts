import type { FastifyInstance } from "fastify";
import { authenticate } from "../../plugins/authenticate.js";
import {
  uploadDocument,
  processDocument,
  listDocuments,
  deleteDocument,
} from "./document.service.js";

export const documentRoutes = async (app: FastifyInstance): Promise<void> => {
  app.addHook("preHandler", authenticate);

  app.post("/upload", async (req, reply) => {
    const { filename, mimeType } = req.body as {
      filename: string;
      mimeType: string;
    };
    if (!filename || !mimeType) {
      return reply
        .status(400)
        .send({ message: "filename and mimeType are required" });
    }
    const result = await uploadDocument(req.user.id, filename, mimeType);
    return reply.status(201).send(result);
  });

  app.post("/:id/process", async (req, reply) => {
    const { id } = req.params as { id: string };
    await processDocument(req.user.id, id);
    return reply.status(202).send({ message: "Processing started" });
  });

  app.get("/", async (req, reply) => {
    const documents = await listDocuments(req.user.id);
    return reply.send(documents);
  });

  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await deleteDocument(req.user.id, id);
    return reply.status(204).send();
  });
};
