import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    // Run in order - 001 has a FOREIGN KEY on "User"(id), so 000 must
    // land first on a fresh database.
    const migrations = ["000_users.sql", "001_documind.sql"];

    for (const file of migrations) {
      const sqlPath = path.join(__dirname, "../prisma", file);
      const sql = fs.readFileSync(sqlPath, "utf8");
      await client.query(sql);
    }

    client.release();
  } catch (err) {
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
