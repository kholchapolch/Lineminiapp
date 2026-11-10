export const CS_PORTAL_SCHEMA_VERSION = "1";

/**
 * Portal content is immutable per dataset_version. app_config stores only
 * pointers, so activating or rolling back a dataset never edits Badge data.
 */
export const csPortalMigrationStatements = [
  `
    CREATE TABLE IF NOT EXISTS app_config (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `,
  `
    CREATE TABLE IF NOT EXISTS cs_portal_products (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      dataset_version CHAR(64) NOT NULL,
      external_key VARCHAR(191) NULL,
      model_name VARCHAR(255) NOT NULL,
      model_key VARCHAR(191) NOT NULL,
      category_code VARCHAR(100) NULL,
      image_url VARCHAR(2048) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_cs_portal_products_version_model
        (dataset_version, model_key),
      KEY idx_cs_portal_products_version_category
        (dataset_version, category_code),
      CONSTRAINT chk_cs_portal_products_sort CHECK (sort_order >= 0)
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `,
  `
    CREATE TABLE IF NOT EXISTS cs_portal_contents (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      dataset_version CHAR(64) NOT NULL,
      external_key VARCHAR(191) NOT NULL,
      locale VARCHAR(10) NOT NULL,
      content_type VARCHAR(32) NOT NULL,
      target_type VARCHAR(32) NOT NULL,
      target_key VARCHAR(191) NOT NULL,
      action_key VARCHAR(100) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      published_at DATETIME(3) NULL,
      payload JSON NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY uq_cs_portal_content_version_locale_type_key
        (dataset_version, locale, content_type, external_key),
      KEY idx_cs_portal_content_lookup
        (dataset_version, locale, content_type, target_type, target_key, action_key),
      KEY idx_cs_portal_content_order
        (dataset_version, locale, content_type, target_key, published_at, sort_order),
      CONSTRAINT chk_cs_portal_content_locale CHECK (locale IN ('th', 'en')),
      CONSTRAINT chk_cs_portal_content_type
        CHECK (content_type IN ('cta', 'article', 'carousel', 'page', 'footer_link')),
      CONSTRAINT chk_cs_portal_target_type
        CHECK (target_type IN ('model', 'category', 'global')),
      CONSTRAINT chk_cs_portal_content_sort CHECK (sort_order >= 0)
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `,
  `
    INSERT IGNORE INTO app_config (\`key\`, \`value\`) VALUES
      ('cs_portal_schema_version', '${CS_PORTAL_SCHEMA_VERSION}'),
      ('cs_portal_active_dataset_version', ''),
      ('cs_portal_draft_dataset_version', '')
  `,
];
