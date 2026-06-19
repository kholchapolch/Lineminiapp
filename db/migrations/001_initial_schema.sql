BEGIN;

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE app_config
  DROP COLUMN IF EXISTS updated_at;

CREATE TABLE IF NOT EXISTS badge_rules (
  id SERIAL PRIMARY KEY,
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('product', 'quest')),
  rule_type TEXT NOT NULL DEFAULT 'achievement' CHECK (rule_type IN ('tier', 'achievement')),
  display_category TEXT NOT NULL DEFAULT 'Achievement badge',
  display_group TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  active_from DATE,
  active_to DATE,
  registration_start DATE,
  registration_end DATE
);

ALTER TABLE badge_rules
  ADD COLUMN IF NOT EXISTS rule_type TEXT NOT NULL DEFAULT 'achievement',
  ADD COLUMN IF NOT EXISTS display_category TEXT NOT NULL DEFAULT 'Achievement badge',
  ADD COLUMN IF NOT EXISTS display_group TEXT,
  ADD COLUMN IF NOT EXISTS active_from DATE,
  ADD COLUMN IF NOT EXISTS active_to DATE,
  ADD COLUMN IF NOT EXISTS registration_start DATE,
  ADD COLUMN IF NOT EXISTS registration_end DATE;

ALTER TABLE badge_rules
  DROP COLUMN IF EXISTS image_url,
  DROP COLUMN IF EXISTS locked_image_url,
  DROP COLUMN IF EXISTS required_count,
  DROP COLUMN IF EXISTS updated_at;

CREATE TABLE IF NOT EXISTS badge_rule_thresholds (
  id SERIAL PRIMARY KEY,
  badge_rule_id INTEGER NOT NULL REFERENCES badge_rules(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  display_name TEXT NOT NULL,
  required_count INTEGER NOT NULL CHECK (required_count >= 0),
  achieved_image_url TEXT,
  locked_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (badge_rule_id, level)
);

ALTER TABLE badge_rule_thresholds
  ADD COLUMN IF NOT EXISTS achieved_image_url TEXT,
  ADD COLUMN IF NOT EXISTS locked_image_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'badge_rule_thresholds'
      AND column_name = 'image_url'
  ) THEN
    EXECUTE 'UPDATE badge_rule_thresholds SET achieved_image_url = COALESCE(achieved_image_url, image_url)';
    EXECUTE 'ALTER TABLE badge_rule_thresholds DROP COLUMN image_url';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS badge_rule_conditions (
  id SERIAL PRIMARY KEY,
  badge_rule_id INTEGER NOT NULL REFERENCES badge_rules(id) ON DELETE CASCADE,
  condition_label TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('any', 'all', 'min_count')),
  required_count INTEGER NOT NULL DEFAULT 1 CHECK (required_count >= 0),
  sony_skus JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (badge_rule_id, condition_label)
);

ALTER TABLE badge_rule_conditions
  DROP COLUMN IF EXISTS sort_order;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'badge_rule_condition_groups'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'badge_rule_condition_items'
  ) THEN
    INSERT INTO badge_rule_conditions (
      badge_rule_id,
      condition_label,
      match_type,
      required_count,
      sony_skus
    )
    SELECT
      cg.badge_rule_id,
      cg.group_label,
      cg.match_type,
      cg.required_count,
      jsonb_agg(ci.sony_sku ORDER BY ci.sort_order ASC, ci.sony_sku ASC)
    FROM badge_rule_condition_groups cg
    LEFT JOIN badge_rule_condition_items ci
      ON ci.condition_group_id = cg.id
    GROUP BY cg.id, cg.badge_rule_id, cg.group_label, cg.match_type, cg.required_count, cg.sort_order
    ON CONFLICT (badge_rule_id, condition_label) DO UPDATE SET
      match_type = EXCLUDED.match_type,
      required_count = EXCLUDED.required_count,
      sony_skus = EXCLUDED.sony_skus;
  END IF;
END $$;

DROP TABLE IF EXISTS badge_rule_condition_items;
DROP TABLE IF EXISTS badge_rule_condition_groups;
DROP TABLE IF EXISTS badge_rule_skus;
DROP TABLE IF EXISTS customer_badges;
DROP TABLE IF EXISTS customers;

CREATE INDEX IF NOT EXISTS idx_badge_rules_active_sort
  ON badge_rules (is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_badge_rule_thresholds_rule_sort
  ON badge_rule_thresholds (badge_rule_id, sort_order);

DROP INDEX IF EXISTS idx_badge_rule_conditions_rule_sort;

CREATE INDEX IF NOT EXISTS idx_badge_rule_conditions_rule
  ON badge_rule_conditions (badge_rule_id);

CREATE TABLE IF NOT EXISTS badge_calculation_logs (
  id SERIAL PRIMARY KEY,
  customer_line_uuid_hash TEXT NOT NULL,
  source_sku_count INTEGER NOT NULL CHECK (source_sku_count >= 0),
  matched_sku_count INTEGER NOT NULL CHECK (matched_sku_count >= 0),
  earned_badges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badge_calculation_logs_created
  ON badge_calculation_logs (created_at DESC);

COMMIT;
