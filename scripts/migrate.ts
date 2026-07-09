import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new pg.Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully. Reading migration SQL...');
    
    const sqlPath = path.join(__dirname, '../prisma/001_documind.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration successfully completed!');
    
    client.release();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
