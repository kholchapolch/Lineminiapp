import { getDatabaseUrl, withConnection } from "./mysql-connection.mjs";
import { loadSeedData } from "./seed-module.mjs";

const EXPECTED_HOST = "mysonybadgesqlprd.mysql.database.azure.com";
const EXPECTED_DATABASE = "lineminidb";
const TARGET_TABLES = [
  "app_config",
  "badge_display_groups",
  "badge_rules",
  "badge_rule_thresholds",
  "badge_rule_conditions",
];

const databaseUrl = new URL(getDatabaseUrl());
const databaseName = databaseUrl.pathname.replace(/^\//, "");

if (databaseUrl.hostname.toLowerCase() !== EXPECTED_HOST) {
  throw new Error(
    `Refusing PROD seed audit for unexpected DB host: ${databaseUrl.hostname}`,
  );
}

if (databaseName !== EXPECTED_DATABASE) {
  throw new Error(
    `Refusing PROD seed audit for unexpected DB name: ${databaseName}`,
  );
}

const {
  appConfig,
  badgeConditions,
  badgeDisplayGroups,
  badgeRules,
  badgeThresholds,
} = await loadSeedData(import.meta.url);
const expectedVersion = appConfig.find(
  ([key]) => key === "badge_rules_version",
)?.[1];
const expectedCounts = {
  badge_display_groups: badgeDisplayGroups.length,
  badge_rules: badgeRules.length,
  badge_rule_thresholds: badgeThresholds.length,
  badge_rule_conditions: badgeConditions.length,
};

if (!expectedVersion) {
  throw new Error("Production seed has no badge_rules_version.");
}

await withConnection(async (pool) => {
  const [tableRows] = await pool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name IN (?)
    `,
    [databaseName, TARGET_TABLES],
  );
  const existingTables = new Set(
    tableRows.map((row) => String(row.TABLE_NAME ?? row.table_name)),
  );
  const counts = {};

  for (const tableName of TARGET_TABLES) {
    if (!existingTables.has(tableName)) {
      counts[tableName] = 0;
      continue;
    }

    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM \`${tableName}\``,
    );
    counts[tableName] = Number(rows[0].count);
  }

  let currentVersion = null;
  if (existingTables.has("app_config")) {
    const [rows] = await pool.execute(
      "SELECT `value` FROM app_config WHERE `key` = 'badge_rules_version'",
    );
    currentVersion = rows[0]?.value ?? null;
  }

  const expectedDataMatches =
    currentVersion === expectedVersion &&
    Object.entries(expectedCounts).every(
      ([tableName, expectedCount]) => counts[tableName] === expectedCount,
    );
  const targetTablesAreEmpty = TARGET_TABLES.every(
    (tableName) => counts[tableName] === 0,
  );
  const status = expectedDataMatches
    ? "already_seeded"
    : targetTablesAreEmpty
      ? "safe_to_seed"
      : "unsafe_nonempty";

  console.log(
    `PROD_SEED_AUDIT=${JSON.stringify({
      status,
      databaseHost: databaseUrl.hostname,
      databaseName,
      existingTables: [...existingTables].sort(),
      counts,
      currentVersion,
      expectedVersion,
      expectedCounts,
    })}`,
  );
});
