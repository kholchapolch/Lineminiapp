import { withConnection } from "./mysql-connection.mjs";

const expected = {
  badge_rules: 12,
  badge_rule_thresholds: 18,
  badge_rule_conditions: 13,
};

await withConnection(async (pool) => {
  for (const [tableName, expectedCount] of Object.entries(expected)) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
    const count = Number(rows[0].count);

    if (count !== expectedCount) {
      throw new Error(`${tableName} expected ${expectedCount} rows but found ${count}.`);
    }
  }

  const [configRows] = await pool.execute(
    "SELECT `value` FROM app_config WHERE `key` = 'badge_rules_version'",
  );
  const badgeRulesVersion = configRows[0]?.value;

  if (!badgeRulesVersion) {
    throw new Error("app_config.badge_rules_version is missing.");
  }

  console.log(`Verified MySQL seed. badge_rules_version=${badgeRulesVersion}`);
});
