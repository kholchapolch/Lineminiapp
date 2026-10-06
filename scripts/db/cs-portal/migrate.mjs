import { withConnection } from "../mysql-connection.mjs";
import {
  CS_PORTAL_SCHEMA_VERSION,
  csPortalMigrationStatements,
} from "./schema.mjs";

const shouldApply = process.argv.includes("--apply");

if (!shouldApply) {
  console.log(
    `CS Portal schema ${CS_PORTAL_SCHEMA_VERSION} check-only plan; no database changes were made.`,
  );
  process.exit(0);
}

await withConnection(async (pool) => {
  for (const statement of csPortalMigrationStatements) {
    await pool.query(statement);
  }
});

console.log(`Applied CS Portal schema ${CS_PORTAL_SCHEMA_VERSION}.`);
