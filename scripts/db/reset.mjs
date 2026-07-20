import { spawnSync } from "node:child_process";
import { withConnection } from "./mysql-connection.mjs";

await withConnection(async (pool) => {
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");
  await pool.query("DROP TABLE IF EXISTS badge_calculation_logs");
  await pool.query("DROP TABLE IF EXISTS badge_rule_conditions");
  await pool.query("DROP TABLE IF EXISTS badge_rule_thresholds");
  await pool.query("DROP TABLE IF EXISTS badge_rules");
  await pool.query("DROP TABLE IF EXISTS badge_display_groups");
  await pool.query("DROP TABLE IF EXISTS app_config");
  await pool.query("SET FOREIGN_KEY_CHECKS = 1");
});

for (const script of ["scripts/db/migrate.mjs", "scripts/db/seed.mjs", "scripts/db/verify.mjs"]) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
