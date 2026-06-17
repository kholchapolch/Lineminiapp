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
  description TEXT,
  image_url TEXT,
  locked_image_url TEXT,
  required_count INTEGER NOT NULL CHECK (required_count >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

COMMIT;
