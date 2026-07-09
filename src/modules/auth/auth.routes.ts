import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { pool } from "../../db/pool.js";

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  // Login
  app.post("/login", async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = getString(body.email).toLowerCase();
    const password = getString(body.password);

    if (!email || !password) {
      return reply
        .code(400)
        .send({ message: "Email and password are required" });
    }

    const result = await pool.query(
      'SELECT id, name, email, "passwordHash" FROM "User" WHERE email = $1',
      [email],
    );

    const user = result.rows[0];
    if (!user) {
      return reply.code(400).send({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return reply.code(400).send({ message: "Invalid email or password" });
    }

    const token = app.jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      { expiresIn: "7d" },
    );

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  });

  // Register
  app.post("/register", async (req, reply) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = getString(body.name);
    const email = getString(body.email).toLowerCase();
    const password = getString(body.password);

    if (!name || !email || !password) {
      return reply
        .code(400)
        .send({ message: "Name, email, and password are required" });
    }

    // Check for existing user
    const existing = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email],
    );
    if (existing.rows.length > 0) {
      return reply.code(400).send({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO "User" (id, name, email, "passwordHash") VALUES ($1, $2, $3, $4)',
      [id, name, email, hash],
    );

    const token = app.jwt.sign({ id, name, email }, { expiresIn: "7d" });

    return reply.status(201).send({ token, user: { id, name, email } });
  });
};
