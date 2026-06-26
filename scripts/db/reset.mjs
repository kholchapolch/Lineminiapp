import { spawnSync } from "node:child_process";

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
