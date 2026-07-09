import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/env.js";

export default fp(async function (fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
});

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; name: string; email: string };
    user: { id: string; name: string; email: string };
  }
}
