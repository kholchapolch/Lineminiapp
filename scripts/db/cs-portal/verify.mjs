import { withConnection } from "../mysql-connection.mjs";
import { CS_PORTAL_SCHEMA_VERSION } from "./schema.mjs";

const requiredTables = ["cs_portal_products", "cs_portal_contents"];
const requiredConfigKeys = [
  "cs_portal_schema_version",
  "cs_portal_active_dataset_version",
  "cs_portal_draft_dataset_version",
];

await withConnection(async (pool) => {
  const [tableRows] = await pool.query(
    `
      SELECT TABLE_NAME AS table_name
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (?, ?)
    `,
    requiredTables,
  );
  const existingTables = new Set(tableRows.map((row) => row.table_name));
  const missingTables = requiredTables.filter((name) => !existingTables.has(name));

  if (missingTables.length > 0) {
    throw new Error(`Missing CS Portal tables: ${missingTables.join(", ")}.`);
  }

  const [configRows] = await pool.query(
    "SELECT `key`, `value` FROM app_config WHERE `key` IN (?, ?, ?)",
    requiredConfigKeys,
  );
  const configByKey = new Map(configRows.map((row) => [row.key, row.value]));
  const missingConfigKeys = requiredConfigKeys.filter((key) => !configByKey.has(key));

  if (missingConfigKeys.length > 0) {
    throw new Error(`Missing CS Portal config keys: ${missingConfigKeys.join(", ")}.`);
  }

  if (configByKey.get("cs_portal_schema_version") !== CS_PORTAL_SCHEMA_VERSION) {
    throw new Error(
      `Expected CS Portal schema version ${CS_PORTAL_SCHEMA_VERSION} but found ${configByKey.get("cs_portal_schema_version")}.`,
    );
  }

  const [badgeCounts] = await pool.query(
    `
      SELECT
        (SELECT COUNT(*) FROM badge_rules) AS badge_rules,
        (SELECT COUNT(*) FROM badge_rule_thresholds) AS badge_rule_thresholds,
        (SELECT COUNT(*) FROM badge_rule_conditions) AS badge_rule_conditions
    `,
  );

  console.log({
    csPortalTables: requiredTables,
    csPortalSchemaVersion: configByKey.get("cs_portal_schema_version"),
    activeDatasetVersion: configByKey.get("cs_portal_active_dataset_version"),
    draftDatasetVersion: configByKey.get("cs_portal_draft_dataset_version"),
    badgeCounts: badgeCounts[0],
  });
});
