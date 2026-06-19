BEGIN;

TRUNCATE badge_calculation_logs, badge_rule_conditions, badge_rule_thresholds, badge_rules, app_config
RESTART IDENTITY CASCADE;

INSERT INTO app_config (key, value) VALUES
  ('campaign_name', 'Sony Badge Pilot'),
  ('support_message', 'Please contact Sony Thailand support if badge data looks incorrect.');

INSERT INTO badge_rules (
  badge_code,
  badge_name,
  badge_type,
  rule_type,
  display_category,
  display_group,
  description,
  sort_order,
  active_from,
  active_to,
  registration_start,
  registration_end
) VALUES
  ('ff-camera-owner', 'Key FF Models', 'product', 'achievement', 'Product ownership badge', 'Key FF models', 'Own one supported Sony full-frame camera body.', 10, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('key-lens-owner', 'Key Lens Models', 'product', 'achievement', 'Product ownership badge', 'Key Lens models', 'Own one supported Sony GM lens.', 20, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('portrait-master', 'Portrait Master', 'quest', 'achievement', 'Achievement badge', 'By COI', 'Own portrait GM lens coverage across 50mm, 85mm, and 135mm.', 30, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('travel-master', 'Travel Master', 'quest', 'achievement', 'Achievement badge', 'By COI', 'Own one wide travel lens and the required travel GM/G lens set.', 40, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('bird-wildlife-master', 'Bird & Wildlife Master', 'quest', 'achievement', 'Achievement badge', 'By COI', 'Own two supported wildlife lenses.', 50, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('trinity-master-gm', 'Trinity Master GM', 'quest', 'achievement', 'Achievement badge', 'By customer pride', 'Own the GM trinity lens set.', 60, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('trinity-master-g', 'Trinity Master G', 'quest', 'achievement', 'Achievement badge', 'By customer pride', 'Own the G trinity lens set.', 70, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('premium-master', 'Premium Master', 'quest', 'achievement', 'Achievement badge', 'By customer pride', 'Own two supported F2 premium lenses.', 80, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('first-macro-lens', 'First Macro Lens', 'quest', 'achievement', 'Achievement badge', 'By customer pride', 'Own one supported macro lens.', 90, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('alpha-body-collector', 'Alpha Body Collector', 'product', 'tier', 'Level badge demo', '10 product tier rules', 'Collect eligible Alpha body products. Bronze 1, Silver 5, Gold 10.', 100, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('gm-lens-collector', 'GM Lens Collector', 'product', 'tier', 'Level badge demo', '10 product tier rules', 'Collect eligible GM lens products. Bronze 1, Silver 5, Gold 10.', 110, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31'),
  ('creator-kit-collector', 'Creator Kit Collector', 'quest', 'tier', 'Level badge demo', 'Shared SKU across many rules', 'Collect eligible creator kit products. Bronze 1, Silver 5, Gold 10.', 120, DATE '2026-05-01', DATE '2026-12-31', DATE '2026-05-01', DATE '2026-12-31');

INSERT INTO badge_rule_thresholds (badge_rule_id, level, display_name, required_count, achieved_image_url, locked_image_url, sort_order)
SELECT br.id, achievement.level, achievement.display_name, achievement.required_count, achievement.achieved_image_url, achievement.locked_image_url, br.sort_order
FROM badge_rules br
JOIN (VALUES
  ('ff-camera-owner', 'achievement', 'Key FF Models', 1, 'https://placehold.co/240x240?text=FF', 'https://placehold.co/240x240?text=Locked'),
  ('key-lens-owner', 'achievement', 'Key Lens Models', 1, 'https://placehold.co/240x240?text=Lens', 'https://placehold.co/240x240?text=Locked'),
  ('portrait-master', 'achievement', 'Portrait Master', 3, 'https://placehold.co/240x240?text=Portrait', 'https://placehold.co/240x240?text=Locked'),
  ('travel-master', 'achievement', 'Travel Master', 5, 'https://placehold.co/240x240?text=Travel', 'https://placehold.co/240x240?text=Locked'),
  ('bird-wildlife-master', 'achievement', 'Bird & Wildlife Master', 2, 'https://placehold.co/240x240?text=Wildlife', 'https://placehold.co/240x240?text=Locked'),
  ('trinity-master-gm', 'achievement', 'Trinity Master GM', 3, 'https://placehold.co/240x240?text=GM', 'https://placehold.co/240x240?text=Locked'),
  ('trinity-master-g', 'achievement', 'Trinity Master G', 3, 'https://placehold.co/240x240?text=G', 'https://placehold.co/240x240?text=Locked'),
  ('premium-master', 'achievement', 'Premium Master', 2, 'https://placehold.co/240x240?text=Premium', 'https://placehold.co/240x240?text=Locked'),
  ('first-macro-lens', 'achievement', 'First Macro Lens', 1, 'https://placehold.co/240x240?text=Macro', 'https://placehold.co/240x240?text=Locked')
) AS achievement(badge_code, level, display_name, required_count, achieved_image_url, locked_image_url)
  ON achievement.badge_code = br.badge_code;

INSERT INTO badge_rule_thresholds (badge_rule_id, level, display_name, required_count, achieved_image_url, locked_image_url, sort_order)
SELECT br.id, tier.level, tier.display_name, tier.required_count, tier.achieved_image_url, tier.locked_image_url, tier.sort_order
FROM badge_rules br
JOIN (VALUES
  ('alpha-body-collector', 'bronze', 'Body Bronze', 1, 'https://placehold.co/240x240?text=Body+Bronze', 'https://placehold.co/240x240?text=Locked', 101),
  ('alpha-body-collector', 'silver', 'Body Silver', 5, 'https://placehold.co/240x240?text=Body+Silver', 'https://placehold.co/240x240?text=Locked', 102),
  ('alpha-body-collector', 'gold', 'Body Gold', 10, 'https://placehold.co/240x240?text=Body+Gold', 'https://placehold.co/240x240?text=Locked', 103),
  ('gm-lens-collector', 'bronze', 'GM Bronze', 1, 'https://placehold.co/240x240?text=GM+Bronze', 'https://placehold.co/240x240?text=Locked', 111),
  ('gm-lens-collector', 'silver', 'GM Silver', 5, 'https://placehold.co/240x240?text=GM+Silver', 'https://placehold.co/240x240?text=Locked', 112),
  ('gm-lens-collector', 'gold', 'GM Gold', 10, 'https://placehold.co/240x240?text=GM+Gold', 'https://placehold.co/240x240?text=Locked', 113),
  ('creator-kit-collector', 'bronze', 'Creator Bronze', 1, 'https://placehold.co/240x240?text=Creator+Bronze', 'https://placehold.co/240x240?text=Locked', 121),
  ('creator-kit-collector', 'silver', 'Creator Silver', 5, 'https://placehold.co/240x240?text=Creator+Silver', 'https://placehold.co/240x240?text=Locked', 122),
  ('creator-kit-collector', 'gold', 'Creator Gold', 10, 'https://placehold.co/240x240?text=Creator+Gold', 'https://placehold.co/240x240?text=Locked', 123)
) AS tier(badge_code, level, display_name, required_count, achieved_image_url, locked_image_url, sort_order)
  ON tier.badge_code = br.badge_code;

INSERT INTO badge_rule_conditions (
  badge_rule_id,
  condition_label,
  match_type,
  required_count,
  sony_skus
)
SELECT
  br.id,
  condition.condition_label,
  condition.match_type,
  condition.required_count,
  to_jsonb(condition.sony_skus)
FROM badge_rules br
JOIN (VALUES
  ('ff-camera-owner', 'Own any key FF model', 'any', 1, ARRAY['ILCE-1M2','ILCE-9M3','ILCE-7RM5','ILCE-7M5','ILCE-7CM2','OTHER_FF']::text[]),
  ('key-lens-owner', 'Own any key lens model', 'any', 1, ARRAY['SEL2470GM2','SEL1635GM2','SEL70200GM2','SEL50F12GM','SEL50F14GM','SEL35F14GM','SEL50150F2GM','SEL2870F2GM','OTHER_GM_LENS']::text[]),
  ('portrait-master', 'Own portrait GM set', 'all', 3, ARRAY['SEL50F14GM','SEL85F14GM2','SEL135F18GM']::text[]),
  ('travel-master', 'Own one wide travel lens', 'any', 1, ARRAY['SEL14F18GM','SEL16F18G','SEL20F18G']::text[]),
  ('travel-master', 'Own required travel lens set', 'all', 4, ARRAY['SEL1635GM2','SEL2470GM2','SEL2450G','SEL20F18G']::text[]),
  ('bird-wildlife-master', 'Own any two wildlife lenses', 'min_count', 2, ARRAY['SEL400800G','SEL200600G','SEL300F28GM','SEL400F28GM','SEL600F28GM']::text[]),
  ('trinity-master-gm', 'Own GM trinity set', 'all', 3, ARRAY['SEL2470GM2','SEL1635GM2','SEL70200GM2']::text[]),
  ('trinity-master-g', 'Own G trinity set', 'all', 3, ARRAY['SEL2450G','SEL1625G','SEL70200G2']::text[]),
  ('premium-master', 'Own two F2 lenses', 'min_count', 2, ARRAY['SEL50150F2GM','SEL2870F2GM']::text[]),
  ('first-macro-lens', 'Own one macro lens', 'any', 1, ARRAY['SEL90M28G','SEL50M28']::text[]),
  ('alpha-body-collector', 'Own Alpha tier demo products', 'min_count', 10, ARRAY['SHARED-TIER-01','BODY-SKU-02','BODY-SKU-03','BODY-SKU-04','BODY-SKU-05','BODY-SKU-06','BODY-SKU-07','BODY-SKU-08','BODY-SKU-09','BODY-SKU-10']::text[]),
  ('gm-lens-collector', 'Own GM tier demo products', 'min_count', 10, ARRAY['SHARED-TIER-01','GM-SKU-02','GM-SKU-03','GM-SKU-04','GM-SKU-05','GM-SKU-06','GM-SKU-07','GM-SKU-08','GM-SKU-09','GM-SKU-10']::text[]),
  ('creator-kit-collector', 'Own creator kit tier demo products', 'min_count', 10, ARRAY['SHARED-TIER-01','BODY-SKU-02','BODY-SKU-03','BODY-SKU-04','BODY-SKU-05','GM-SKU-02','GM-SKU-03','GM-SKU-04','GM-SKU-05','GM-SKU-06']::text[])
) AS condition(badge_code, condition_label, match_type, required_count, sony_skus)
  ON condition.badge_code = br.badge_code;

COMMIT;
