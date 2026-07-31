import { readFile, writeFile } from "node:fs/promises";
import {
  appConfig,
  badgeConditions,
  badgeDisplayGroups,
  badgeRules,
  badgeThresholds,
} from "./seed-data.mjs";

const outputUrl = new URL("./seed-all-rules.sql", import.meta.url);

export function renderSeedSql() {
  const ruleCodes = badgeRules.map((rule) => rule.code);
  const groupCodes = badgeDisplayGroups.map((group) => group.code);

  return [
    "-- GENERATED FILE. DO NOT EDIT BY HAND.",
    "-- Source: scripts/db/seed-data.mjs",
    "-- Regenerate: npm run db:seed:sql",
    "-- Prerequisite: run scripts/db/migrate.mjs or npm run db:migrate first.",
    `-- Rows: ${badgeDisplayGroups.length} groups, ${badgeRules.length} rules, ${badgeThresholds.length} thresholds, ${badgeConditions.length} conditions.`,
    "",
    "SET NAMES utf8mb4;",
    "START TRANSACTION;",
    "",
    renderAppConfig(),
    "",
    renderDisplayGroups(groupCodes),
    "",
    renderBadgeRules(ruleCodes),
    "",
    renderThresholds(ruleCodes),
    "",
    renderConditions(ruleCodes),
    "",
    "COMMIT;",
    "",
  ].join("\n");
}

function renderAppConfig() {
  const values = appConfig
    .map(([key, value]) => `  (${sqlValue(key)}, ${sqlValue(value)})`)
    .join(",\n");

  return [
    "INSERT INTO app_config (`key`, `value`)",
    "VALUES",
    values,
    "ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);",
  ].join("\n");
}

function renderDisplayGroups(groupCodes) {
  const values = badgeDisplayGroups
    .map((group) =>
      sqlRow([
        group.code,
        group.badgeType,
        group.displayName,
        group.sortOrder,
        true,
      ]),
    )
    .join(",\n");

  return [
    "INSERT INTO badge_display_groups (",
    "  group_code, badge_type, display_name, sort_order, is_active",
    ")",
    "VALUES",
    values,
    "ON DUPLICATE KEY UPDATE",
    "  badge_type = VALUES(badge_type),",
    "  display_name = VALUES(display_name),",
    "  sort_order = VALUES(sort_order),",
    "  is_active = VALUES(is_active);",
    `DELETE FROM badge_display_groups WHERE group_code NOT IN (${sqlList(groupCodes)});`,
  ].join("\n");
}

function renderBadgeRules(ruleCodes) {
  const values = badgeRules
    .map((rule) =>
      sqlRow([
        rule.code,
        rule.name,
        rule.badgeType,
        rule.ruleType,
        rule.displayCategory,
        rule.displayGroup,
        rule.displayGroupCode,
        rule.productModelCode,
        rule.productUrl,
        rule.description,
        rule.sortOrder,
        true,
        rule.activeFrom,
        rule.activeTo,
        rule.registrationStart,
        rule.registrationEnd,
      ]),
    )
    .join(",\n");

  return [
    "INSERT INTO badge_rules (",
    "  badge_code, badge_name, badge_type, rule_type, display_category, display_group,",
    "  display_group_code, product_model_code, product_url, description, sort_order,",
    "  is_active, active_from, active_to, registration_start, registration_end",
    ")",
    "VALUES",
    values,
    "ON DUPLICATE KEY UPDATE",
    "  badge_name = VALUES(badge_name),",
    "  badge_type = VALUES(badge_type),",
    "  rule_type = VALUES(rule_type),",
    "  display_category = VALUES(display_category),",
    "  display_group = VALUES(display_group),",
    "  display_group_code = VALUES(display_group_code),",
    "  product_model_code = VALUES(product_model_code),",
    "  product_url = VALUES(product_url),",
    "  description = VALUES(description),",
    "  sort_order = VALUES(sort_order),",
    "  is_active = VALUES(is_active),",
    "  active_from = VALUES(active_from),",
    "  active_to = VALUES(active_to),",
    "  registration_start = VALUES(registration_start),",
    "  registration_end = VALUES(registration_end);",
    `DELETE FROM badge_rules WHERE badge_code NOT IN (${sqlList(ruleCodes)});`,
  ].join("\n");
}

function renderThresholds(ruleCodes) {
  const values = badgeThresholds
    .map((threshold) =>
      `  ((SELECT id FROM badge_rules WHERE badge_code = ${sqlValue(threshold.ruleCode)}), ${[
        threshold.level,
        threshold.displayName,
        threshold.requiredCount,
        threshold.achievedImageUrl,
        threshold.lockedImageUrl,
        threshold.shareImageUrl,
        threshold.sortOrder,
      ].map(sqlValue).join(", ")})`,
    )
    .join(",\n");

  return [
    "DELETE FROM badge_rule_thresholds",
    `WHERE badge_rule_id IN (SELECT id FROM badge_rules WHERE badge_code IN (${sqlList(ruleCodes)}));`,
    "INSERT INTO badge_rule_thresholds (",
    "  badge_rule_id, level, display_name, required_count, achieved_image_url,",
    "  locked_image_url, share_image_url, sort_order",
    ")",
    "VALUES",
    `${values};`,
  ].join("\n");
}

function renderConditions(ruleCodes) {
  const values = badgeConditions
    .map((condition) =>
      `  ((SELECT id FROM badge_rules WHERE badge_code = ${sqlValue(condition.ruleCode)}), ${[
        condition.label,
        condition.matchType,
        condition.requiredCount,
        JSON.stringify(condition.sonySkus),
      ].map(sqlValue).join(", ")})`,
    )
    .join(",\n");

  return [
    "DELETE FROM badge_rule_conditions",
    `WHERE badge_rule_id IN (SELECT id FROM badge_rules WHERE badge_code IN (${sqlList(ruleCodes)}));`,
    "INSERT INTO badge_rule_conditions (",
    "  badge_rule_id, condition_label, match_type, required_count, sony_skus",
    ")",
    "VALUES",
    `${values};`,
  ].join("\n");
}

function sqlRow(values) {
  return `  (${values.map(sqlValue).join(", ")})`;
}

function sqlList(values) {
  return values.map(sqlValue).join(", ");
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
}

const generatedSql = renderSeedSql();

if (process.argv.includes("--check")) {
  const currentSql = await readFile(outputUrl, "utf8").catch(() => "");

  if (normalizeLineEndings(currentSql) !== normalizeLineEndings(generatedSql)) {
    throw new Error("scripts/db/seed-all-rules.sql is stale. Run npm run db:seed:sql.");
  }

  console.log("Verified generated manual seed SQL is current.");
} else {
  await writeFile(outputUrl, generatedSql, "utf8");
  console.log(`Generated ${outputUrl.pathname}.`);
}

function normalizeLineEndings(value) {
  return value.replaceAll("\r\n", "\n");
}
