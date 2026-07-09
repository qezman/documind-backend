import Fastify from "fastify";
import { env } from "./config/env.js";
import jwtPlugin from "./plugins/jwt.js";
import corsPlugin from "./plugins/cors.js";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { documentRoutes } from "./modules/documents/document.routes.js";
import { chatRoutes } from "./modules/chats/chat.routes.js";
import { uploadRoutes } from "./modules/uploads/upload.routes.js";
import { AppError } from "./utils/errors.js";

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(corsPlugin);
  await fastify.register(jwtPlugin);

  fastify.get("/health", async () => ({ status: "ok" }));

  // Auth routes (no JWT required)
  fastify.register(authRoutes, { prefix: "/auth" });

  // Protected routes
  fastify.register(documentRoutes, { prefix: "/documents" });
  fastify.register(chatRoutes, { prefix: "/documents" });
  fastify.register(uploadRoutes, { prefix: "/uploads" });

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    fastify.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  });

  try {
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`DocuMind backend running on http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
