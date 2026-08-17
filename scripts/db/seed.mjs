import { withConnection } from "./mysql-connection.mjs";
import { loadSeedData } from "./seed-module.mjs";

const {
  appConfig,
  badgeConditions,
  badgeDisplayGroups,
  badgeRules,
  badgeThresholds,
} = await loadSeedData(import.meta.url);

async function upsertAppConfig(connection) {
  for (const [key, value] of appConfig) {
    await connection.execute(
      `
        INSERT INTO app_config (\`key\`, \`value\`)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
      `,
      [key, value],
    );
  }
}

async function replaceBadgeDisplayGroups(connection) {
  await connection.execute("DELETE FROM badge_display_groups");

  for (const group of badgeDisplayGroups) {
    await connection.execute(
      `
        INSERT INTO badge_display_groups (
          group_code,
          badge_type,
          display_name,
          sort_order,
          is_active
        )
        VALUES (?, ?, ?, ?, TRUE)
      `,
      [group.code, group.badgeType, group.displayName, group.sortOrder],
    );
  }
}

async function upsertBadgeRules(connection) {
  const ruleIds = new Map();

  for (const rule of badgeRules) {
    await connection.execute(
      `
        INSERT INTO badge_rules (
          badge_code,
          badge_name,
          badge_type,
          rule_type,
          display_category,
          display_group,
          display_group_code,
          product_model_code,
          product_url,
          description,
          sort_order,
          is_active,
          active_from,
          active_to,
          registration_start,
          registration_end
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          id = LAST_INSERT_ID(id),
          badge_name = VALUES(badge_name),
          badge_type = VALUES(badge_type),
          rule_type = VALUES(rule_type),
          display_category = VALUES(display_category),
          display_group = VALUES(display_group),
          display_group_code = VALUES(display_group_code),
          product_model_code = VALUES(product_model_code),
          product_url = VALUES(product_url),
          description = VALUES(description),
          sort_order = VALUES(sort_order),
          is_active = VALUES(is_active),
          active_from = VALUES(active_from),
          active_to = VALUES(active_to),
          registration_start = VALUES(registration_start),
          registration_end = VALUES(registration_end)
      `,
      [
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
        rule.activeFrom,
        rule.activeTo,
        rule.registrationStart,
        rule.registrationEnd,
      ],
    );

    const [rows] = await connection.execute(
      "SELECT id FROM badge_rules WHERE badge_code = ?",
      [rule.code],
    );
    ruleIds.set(rule.code, rows[0].id);
  }

  return ruleIds;
}

async function replaceThresholds(connection, ruleIds) {
  await connection.execute(
    `DELETE FROM badge_rule_thresholds WHERE badge_rule_id IN (${placeholders(ruleIds.size)})`,
    Array.from(ruleIds.values()),
  );

  for (const threshold of badgeThresholds) {
    await connection.execute(
      `
        INSERT INTO badge_rule_thresholds (
          badge_rule_id,
          level,
          display_name,
          required_count,
          achieved_image_url,
          locked_image_url,
          share_image_url,
          sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ruleIds.get(threshold.ruleCode),
        threshold.level,
        threshold.displayName,
        threshold.requiredCount,
        threshold.achievedImageUrl,
        threshold.lockedImageUrl,
        threshold.shareImageUrl,
        threshold.sortOrder,
      ],
    );
  }
}

async function replaceConditions(connection, ruleIds) {
  await connection.execute(
    `DELETE FROM badge_rule_conditions WHERE badge_rule_id IN (${placeholders(ruleIds.size)})`,
    Array.from(ruleIds.values()),
  );

  for (const condition of badgeConditions) {
    await connection.execute(
      `
        INSERT INTO badge_rule_conditions (
          badge_rule_id,
          condition_label,
          match_type,
          required_count,
          sony_skus
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        ruleIds.get(condition.ruleCode),
        condition.label,
        condition.matchType,
        condition.requiredCount,
        JSON.stringify(condition.sonySkus),
      ],
    );
  }
}

async function removeObsoleteBadgeRules(connection, ruleIds) {
  await connection.execute(
    `DELETE FROM badge_rules WHERE id NOT IN (${placeholders(ruleIds.size)})`,
    Array.from(ruleIds.values()),
  );
}

function placeholders(count) {
  if (count <= 0) {
    throw new Error("Expected at least one seeded badge rule.");
  }

  return Array.from({ length: count }, () => "?").join(", ");
}

await withConnection(async (pool) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await upsertAppConfig(connection);
    await replaceBadgeDisplayGroups(connection);
    const ruleIds = await upsertBadgeRules(connection);
    await replaceThresholds(connection, ruleIds);
    await replaceConditions(connection, ruleIds);
    await removeObsoleteBadgeRules(connection, ruleIds);
    await connection.commit();

    console.log(
      `Seeded ${badgeRules.length} rules, ${badgeThresholds.length} thresholds, ${badgeConditions.length} conditions.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
