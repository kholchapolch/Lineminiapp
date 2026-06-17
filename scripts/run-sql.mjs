import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const [, , sqlFile] = process.argv;

if (!sqlFile) {
  console.error("Usage: node scripts/run-sql.mjs <sql-file>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const filePath = resolve(process.cwd(), sqlFile);
const sql = await readFile(filePath, "utf8");
const client = new pg.Client({ connectionString });

try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied ${sqlFile}`);
} finally {
  await client.end();
}
