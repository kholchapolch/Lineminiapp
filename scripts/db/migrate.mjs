import { withConnection } from "./mysql-connection.mjs";

const statements = [
  `
    CREATE TABLE IF NOT EXISTS app_config (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` TEXT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS badge_display_groups (
      group_code VARCHAR(120) NOT NULL PRIMARY KEY,
      badge_type VARCHAR(40) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      CONSTRAINT chk_badge_display_groups_badge_type CHECK (badge_type IN ('product', 'quest'))
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS badge_rules (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      badge_code VARCHAR(120) NOT NULL UNIQUE,
      badge_name VARCHAR(255) NOT NULL,
      badge_type VARCHAR(40) NOT NULL,
      rule_type VARCHAR(40) NOT NULL DEFAULT 'achievement',
      display_category VARCHAR(120) NOT NULL DEFAULT 'Achievement badge',
      display_group VARCHAR(120) NULL,
      display_group_code VARCHAR(120) NULL,
      product_model_code VARCHAR(120) NULL,
      product_url TEXT NULL,
      description TEXT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      active_from DATE NULL,
      active_to DATE NULL,
      registration_start DATE NULL,
      registration_end DATE NULL,
      CONSTRAINT chk_badge_rules_badge_type CHECK (badge_type IN ('product', 'quest')),
      CONSTRAINT chk_badge_rules_rule_type CHECK (rule_type IN ('tier', 'achievement'))
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS badge_rule_thresholds (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      badge_rule_id INT NOT NULL,
      level VARCHAR(80) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      required_count INT NOT NULL,
      achieved_image_url TEXT NULL,
      locked_image_url TEXT NULL,
      share_image_url TEXT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      UNIQUE KEY uq_badge_rule_threshold_level (badge_rule_id, level),
      CONSTRAINT chk_badge_rule_thresholds_required_count CHECK (required_count >= 0),
      CONSTRAINT fk_badge_rule_thresholds_rule
        FOREIGN KEY (badge_rule_id) REFERENCES badge_rules(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS badge_rule_conditions (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      badge_rule_id INT NOT NULL,
      condition_label VARCHAR(255) NOT NULL,
      match_type VARCHAR(40) NOT NULL,
      required_count INT NOT NULL DEFAULT 1,
      sony_skus JSON NOT NULL,
      UNIQUE KEY uq_badge_rule_condition_label (badge_rule_id, condition_label),
      CONSTRAINT chk_badge_rule_conditions_match_type CHECK (match_type IN ('any', 'all', 'min_count')),
      CONSTRAINT chk_badge_rule_conditions_required_count CHECK (required_count >= 0),
      CONSTRAINT fk_badge_rule_conditions_rule
        FOREIGN KEY (badge_rule_id) REFERENCES badge_rules(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS badge_calculation_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      customer_line_uuid_hash VARCHAR(128) NOT NULL,
      source_sku_count INT NOT NULL,
      matched_sku_count INT NOT NULL,
      earned_badges_json JSON NOT NULL,
      error_code VARCHAR(120) NULL,
      error_message TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_badge_calculation_logs_source_sku_count CHECK (source_sku_count >= 0),
      CONSTRAINT chk_badge_calculation_logs_matched_sku_count CHECK (matched_sku_count >= 0)
    )
  `,
  "ALTER TABLE badge_rules ADD COLUMN display_group_code VARCHAR(120) NULL AFTER display_group",
  "ALTER TABLE badge_rules ADD COLUMN product_model_code VARCHAR(120) NULL AFTER display_group_code",
  "ALTER TABLE badge_rules ADD COLUMN product_url TEXT NULL AFTER product_model_code",
  "ALTER TABLE badge_rule_thresholds ADD COLUMN share_image_url TEXT NULL AFTER locked_image_url",
  "CREATE INDEX idx_badge_rules_active_sort ON badge_rules (is_active, sort_order)",
  "CREATE INDEX idx_badge_rules_group_sort ON badge_rules (display_group_code, sort_order)",
  "CREATE INDEX idx_badge_rule_thresholds_rule_sort ON badge_rule_thresholds (badge_rule_id, sort_order)",
  "CREATE INDEX idx_badge_rule_conditions_rule ON badge_rule_conditions (badge_rule_id)",
  "CREATE INDEX idx_badge_calculation_logs_created ON badge_calculation_logs (created_at DESC)",
];

async function applyStatement(pool, statement) {
  try {
    await pool.query(statement);
  } catch (error) {
    if (error && (error.code === "ER_DUP_KEYNAME" || error.code === "ER_DUP_FIELDNAME")) {
      return;
    }

    throw error;
  }
}

await withConnection(async (pool) => {
  for (const statement of statements) {
    await applyStatement(pool, statement);
  }
});

console.log("Applied MySQL schema migration.");
