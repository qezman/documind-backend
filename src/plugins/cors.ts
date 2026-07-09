import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async function (fastify, opts) {
  fastify.register(cors, {
    origin: true, // Echo back request origin or restrict as needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
});
