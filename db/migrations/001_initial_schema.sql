BEGIN;

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  line_display_name TEXT,
  line_picture_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badge_rules (
  id SERIAL PRIMARY KEY,
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('product', 'quest')),
  rule_type TEXT NOT NULL DEFAULT 'achievement' CHECK (rule_type IN ('tier', 'achievement')),
  description TEXT,
  image_url TEXT,
  locked_image_url TEXT,
  required_count INTEGER NOT NULL CHECK (required_count >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  active_from DATE,
  active_to DATE,
  registration_start DATE,
  registration_end DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE badge_rules
  ADD COLUMN IF NOT EXISTS rule_type TEXT NOT NULL DEFAULT 'achievement',
  ADD COLUMN IF NOT EXISTS active_from DATE,
  ADD COLUMN IF NOT EXISTS active_to DATE,
  ADD COLUMN IF NOT EXISTS registration_start DATE,
  ADD COLUMN IF NOT EXISTS registration_end DATE;

CREATE TABLE IF NOT EXISTS badge_rule_thresholds (
  id SERIAL PRIMARY KEY,
  badge_rule_id INTEGER NOT NULL REFERENCES badge_rules(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  display_name TEXT NOT NULL,
  required_count INTEGER NOT NULL CHECK (required_count >= 0),
  image_url TEXT,
  locked_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (badge_rule_id, level)
);

CREATE TABLE IF NOT EXISTS badge_rule_skus (
  id SERIAL PRIMARY KEY,
  badge_rule_id INTEGER NOT NULL REFERENCES badge_rules(id) ON DELETE CASCADE,
  sony_sku TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (badge_rule_id, sony_sku)
);

CREATE INDEX IF NOT EXISTS idx_badge_rules_active_sort
  ON badge_rules (is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_badge_rule_thresholds_rule_sort
  ON badge_rule_thresholds (badge_rule_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_badge_rule_skus_sku_active
  ON badge_rule_skus (sony_sku, is_active);

CREATE TABLE IF NOT EXISTS customer_badges (
  id SERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  badge_rule_id INTEGER NOT NULL REFERENCES badge_rules(id) ON DELETE CASCADE,
  matched_count INTEGER NOT NULL CHECK (matched_count >= 0),
  serial_number TEXT,
  model_name TEXT,
  registration_date DATE,
  issued_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, badge_rule_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_badges_customer
  ON customer_badges (customer_id);

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
