-- -------------------------------------------------------------
-- TablePlus 26.9.6(762)
--
-- https://tableplus.com/
--
-- Database: lineminidb
-- Generation Time: 2569-08-17 13:17:12.9350
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `app_config`;
CREATE TABLE `app_config` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `badge_calculation_logs`;
CREATE TABLE `badge_calculation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_line_uuid_hash` varchar(128) NOT NULL,
  `source_sku_count` int NOT NULL,
  `matched_sku_count` int NOT NULL,
  `earned_badges_json` json NOT NULL,
  `error_code` varchar(120) DEFAULT NULL,
  `error_message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_badge_calculation_logs_created` (`created_at` DESC),
  CONSTRAINT `chk_badge_calculation_logs_matched_sku_count` CHECK ((`matched_sku_count` >= 0)),
  CONSTRAINT `chk_badge_calculation_logs_source_sku_count` CHECK ((`source_sku_count` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `badge_display_groups`;
CREATE TABLE `badge_display_groups` (
  `group_code` varchar(120) NOT NULL,
  `badge_type` varchar(40) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`group_code`),
  CONSTRAINT `chk_badge_display_groups_badge_type` CHECK ((`badge_type` in (_utf8mb4'product',_utf8mb4'quest')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `badge_rule_conditions`;
CREATE TABLE `badge_rule_conditions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `badge_rule_id` int NOT NULL,
  `condition_label` varchar(255) NOT NULL,
  `match_type` varchar(40) NOT NULL,
  `required_count` int NOT NULL DEFAULT '1',
  `sony_skus` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_badge_rule_condition_label` (`badge_rule_id`,`condition_label`),
  KEY `idx_badge_rule_conditions_rule` (`badge_rule_id`),
  CONSTRAINT `fk_badge_rule_conditions_rule` FOREIGN KEY (`badge_rule_id`) REFERENCES `badge_rules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_badge_rule_conditions_match_type` CHECK ((`match_type` in (_utf8mb3'any',_utf8mb3'all',_utf8mb3'min_count'))),
  CONSTRAINT `chk_badge_rule_conditions_required_count` CHECK ((`required_count` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `badge_rule_thresholds`;
CREATE TABLE `badge_rule_thresholds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `badge_rule_id` int NOT NULL,
  `level` varchar(80) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `required_count` int NOT NULL,
  `achieved_image_url` text,
  `locked_image_url` text,
  `share_image_url` text,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_badge_rule_threshold_level` (`badge_rule_id`,`level`),
  KEY `idx_badge_rule_thresholds_rule_sort` (`badge_rule_id`,`sort_order`),
  CONSTRAINT `fk_badge_rule_thresholds_rule` FOREIGN KEY (`badge_rule_id`) REFERENCES `badge_rules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_badge_rule_thresholds_required_count` CHECK ((`required_count` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `badge_rules`;
CREATE TABLE `badge_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `badge_code` varchar(120) NOT NULL,
  `badge_name` varchar(255) NOT NULL,
  `badge_type` varchar(40) NOT NULL,
  `rule_type` varchar(40) NOT NULL DEFAULT 'achievement',
  `display_category` varchar(120) NOT NULL DEFAULT 'Achievement badge',
  `display_group` varchar(120) DEFAULT NULL,
  `display_group_code` varchar(120) DEFAULT NULL,
  `product_model_code` varchar(120) DEFAULT NULL,
  `product_url` text,
  `description` text,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `active_from` date DEFAULT NULL,
  `active_to` date DEFAULT NULL,
  `registration_start` date DEFAULT NULL,
  `registration_end` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `badge_code` (`badge_code`),
  KEY `idx_badge_rules_active_sort` (`is_active`,`sort_order`),
  KEY `idx_badge_rules_group_sort` (`display_group_code`,`sort_order`),
  CONSTRAINT `chk_badge_rules_badge_type` CHECK ((`badge_type` in (_utf8mb3'product',_utf8mb3'quest'))),
  CONSTRAINT `chk_badge_rules_rule_type` CHECK ((`rule_type` in (_utf8mb3'tier',_utf8mb3'achievement')))
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb3;

INSERT INTO `app_config` (`key`, `value`) VALUES
('badge_rules_version', '2026-07-24-product-urls-001'),
('campaign_name', 'Sony Badge Pilot'),
('support_message', 'Please contact Sony Thailand support if badge data looks incorrect.');

INSERT INTO `badge_display_groups` (`group_code`, `badge_type`, `display_name`, `sort_order`, `is_active`) VALUES
('full-frame-camera', 'product', 'Full Frame Camera', 10, 1),
('macro-lens', 'product', 'Macro Lens', 50, 1),
('prime-lens', 'product', 'Prime Lens', 20, 1),
('quest', 'quest', 'Quest Badge', 100, 1),
('telephoto-super-telephoto-lens', 'product', 'Telephoto & Super Telephoto Lens', 40, 1),
('wide-normal-zoom-lens', 'product', 'Wide & Normal Zoom Lens', 30, 1);

INSERT INTO `badge_rule_conditions` (`id`, `badge_rule_id`, `condition_label`, `match_type`, `required_count`, `sony_skus`) VALUES
(1, 1, 'Own SEL100M28GM', 'any', 1, '[\"SEL100M28GM\"]'),
(2, 2, 'Own SEL90M28G', 'any', 1, '[\"SEL90M28G\"]'),
(3, 3, 'Own SEL30M35', 'any', 1, '[\"SEL30M35\"]'),
(4, 4, 'Own SEL135F18GM', 'any', 1, '[\"SEL135F18GM\"]'),
(5, 5, 'Own SEL14F18GM', 'any', 1, '[\"SEL14F18GM\"]'),
(6, 6, 'Own SEL16F18G', 'any', 1, '[\"SEL16F18G\"]'),
(7, 7, 'Own SEL20F18G', 'any', 1, '[\"SEL20F18G\"]'),
(8, 8, 'Own SEL24F14GM', 'any', 1, '[\"SEL24F14GM\"]'),
(9, 9, 'Own SEL24F28G', 'any', 1, '[\"SEL24F28G\"]'),
(10, 10, 'Own SEL35F14GM', 'any', 1, '[\"SEL35F14GM\"]'),
(11, 11, 'Own SEL35F18F', 'any', 1, '[\"SEL35F18F\"]'),
(12, 12, 'Own SEL50F12GM', 'any', 1, '[\"SEL50F12GM\"]'),
(13, 13, 'Own SEL50F14GM', 'any', 1, '[\"SEL50F14GM\"]'),
(14, 14, 'Own SEL50M28', 'any', 1, '[\"SEL50M28\"]'),
(15, 15, 'Own SEL85F14GM', 'any', 1, '[\"SEL85F14GM\"]'),
(16, 16, 'Own SEL85F14GM2', 'any', 1, '[\"SEL85F14GM2\"]'),
(17, 17, 'Own SEL1655G', 'any', 1, '[\"SEL1655G\"]'),
(18, 18, 'Own SEL55210', 'any', 1, '[\"SEL55210\"]'),
(19, 19, 'Own SELP18110G', 'any', 1, '[\"SELP18110G\"]'),
(20, 20, 'Own SEL1625G', 'any', 1, '[\"SEL1625G\"]'),
(21, 21, 'Own SEL1635GM', 'any', 1, '[\"SEL1635GM\"]'),
(22, 22, 'Own SEL1635GM2', 'any', 1, '[\"SEL1635GM2\"]'),
(23, 23, 'Own SEL2070G', 'any', 1, '[\"SEL2070G\"]'),
(24, 24, 'Own SEL24105G', 'any', 1, '[\"SEL24105G\"]'),
(25, 25, 'Own SEL2450G', 'any', 1, '[\"SEL2450G\"]'),
(26, 26, 'Own SEL2470GM', 'any', 1, '[\"SEL2470GM\"]'),
(27, 27, 'Own SEL2470GM2', 'any', 1, '[\"SEL2470GM2\"]'),
(28, 28, 'Own SEL2870GM', 'any', 1, '[\"SEL2870GM\"]'),
(29, 29, 'Own SEL50150GM', 'any', 1, '[\"SEL50150GM\"]'),
(30, 30, 'Own SELC1635G', 'any', 1, '[\"SELC1635G\"]'),
(31, 31, 'Own SELP1635G', 'any', 1, '[\"SELP1635G\"]'),
(32, 32, 'Own SELP28135G', 'any', 1, '[\"SELP28135G\"]'),
(33, 33, 'Own SEL1635Z', 'any', 1, '[\"SEL1635Z\"]'),
(34, 34, 'Own SEL2470Z', 'any', 1, '[\"SEL2470Z\"]'),
(35, 35, 'Own SEL70350G', 'any', 1, '[\"SEL70350G\"]'),
(36, 36, 'Own SEL100400MC', 'any', 1, '[\"SEL100400MC\"]'),
(37, 37, 'Own SEL100400GM', 'any', 1, '[\"SEL100400GM\"]'),
(38, 38, 'Own SEL200600G', 'any', 1, '[\"SEL200600G\"]'),
(39, 39, 'Own SEL300F28GM', 'any', 1, '[\"SEL300F28GM\"]'),
(40, 40, 'Own SEL400800G', 'any', 1, '[\"SEL400800G\"]'),
(41, 41, 'Own SEL400F28GM', 'any', 1, '[\"SEL400F28GM\"]'),
(42, 42, 'Own SEL600F40GM', 'any', 1, '[\"SEL600F40GM\"]'),
(43, 43, 'Own SEL70200GM', 'any', 1, '[\"SEL70200GM\"]'),
(44, 44, 'Own SEL70200GM2', 'any', 1, '[\"SEL70200GM2\"]'),
(45, 45, 'Own SEL70200G', 'any', 1, '[\"SEL70200G\"]'),
(46, 46, 'Own SEL70200G2', 'any', 1, '[\"SEL70200G2\"]'),
(47, 47, 'Own ILCE-1M2', 'any', 1, '[\"ILCE-1M2\"]'),
(48, 48, 'Own ILCE-9M3', 'any', 1, '[\"ILCE-9M3\"]'),
(49, 49, 'Own ILCE-7RM5', 'any', 1, '[\"ILCE-7RM5\"]'),
(50, 50, 'Own ILCE-7M5', 'any', 1, '[\"ILCE-7M5\"]'),
(51, 51, 'Own ILCE-7M4', 'any', 1, '[\"ILCE-7M4\"]'),
(52, 52, 'Own ILCE-7M3', 'any', 1, '[\"ILCE-7M3\"]'),
(53, 53, 'Own ILCE-7CM2', 'any', 1, '[\"ILCE-7CM2\"]'),
(54, 54, 'Own ILCE-7C', 'any', 1, '[\"ILCE-7C\"]'),
(55, 55, 'Own ILCE-7CR', 'any', 1, '[\"ILCE-7CR\"]'),
(56, 56, 'Own ILCE-7SM3', 'any', 1, '[\"ILCE-7SM3\"]'),
(57, 57, 'Collect eligible Portrait Master models', 'min_count', 4, '[\"SEL35F14GM\", \"SEL50F14GM\", \"SEL50F12GM\", \"SEL85F14GM\", \"SEL85F14GM2\", \"SEL100M28GM\", \"SEL135F18GM\"]'),
(58, 58, 'Collect eligible Wide Architect models', 'min_count', 5, '[\"SEL1224GM\", \"SEL14F18GM\", \"SEL16F18G\", \"SEL20F18G\", \"SEL1625G\", \"SEL1635GM\", \"SEL1635GM2\", \"SEL1635Z\", \"SEL2470GM\", \"SEL2470GM2\", \"SEL2450G\", \"SELC1635G\", \"SEL1655G\", \"SEL2070G\", \"SEL24105G\", \"SEL2470Z\", \"SEL24F14GM\", \"SEL24F28G\", \"SEL2870GM\", \"SEL35F14GM\", \"SEL35F18F\", \"SELP1635G\", \"SELP18110G\", \"SELP28135G\"]'),
(59, 59, 'Collect eligible The Visionary models', 'min_count', 4, '[\"SEL100400GM\", \"SEL400800G\", \"SEL200600G\", \"SEL300F28GM\", \"SEL400F28GM\", \"SEL600F40GM\", \"SEL70350G\", \"SEL55210\", \"SEL100400MC\"]'),
(60, 60, 'Own one 16-35 GM family model', 'any', 1, '[\"SEL1635GM\", \"SEL1635GM2\"]'),
(61, 60, 'Own one 24-70 GM family model', 'any', 1, '[\"SEL2470GM\", \"SEL2470GM2\"]'),
(62, 60, 'Own one 70-200 GM family model', 'any', 1, '[\"SEL70200GM\", \"SEL70200GM2\"]'),
(63, 61, 'Own all Trinity Junior models', 'all', 3, '[\"SEL2450G\", \"SEL1625G\", \"SEL70200G2\"]'),
(64, 62, 'Own any three All Rounder models', 'min_count', 3, '[\"SEL2070G\", \"SELP1635G\", \"SEL1635Z\", \"SEL70200G\"]'),
(65, 63, 'Own both F2 Master models', 'all', 2, '[\"SEL2870GM\", \"SEL50150GM\"]'),
(66, 64, 'Own any one macro model', 'any', 1, '[\"SEL100M28GM\", \"SEL90M28G\", \"SEL50M28\", \"SEL30M35\"]'),
(67, 56, 'Own SEL1224GM', 'any', 1, '[\"SEL1224GM\"]');

INSERT INTO `badge_rule_thresholds` (`id`, `badge_rule_id`, `level`, `display_name`, `required_count`, `achieved_image_url`, `locked_image_url`, `share_image_url`, `sort_order`) VALUES
(1, 1, 'achievement', 'FE 100 mm.F2.8 Macro GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%20Lens/SEL100M28GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%20Lens/SEL100M28GM.png', 1),
(2, 2, 'achievement', 'FE 90mm F2.8 Macro G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%20Lens/SEL90M28G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Macro%20Lens/SEL90M28G.png', 2),
(3, 3, 'achievement', 'E 30mm F3.5 Macro', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL30M35.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL30M35.png', 101),
(4, 4, 'achievement', 'FE 135mm F1.8 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL135F18GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL135F18GM.png', 102),
(5, 5, 'achievement', 'FE 14mm F1.8 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL14F18GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL14F18GM.png', 103),
(6, 6, 'achievement', 'FE 16mm F1.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL16F18G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL16F18G.png', 104),
(7, 7, 'achievement', 'FE 20mm F1.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL20F18G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL20F18G.png', 105),
(8, 8, 'achievement', 'FE 24mm F1.4 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL24F14GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL24F14GM.png', 106),
(9, 9, 'achievement', 'FE 24mm F2.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL24F28G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL24F28G.png', 107),
(10, 10, 'achievement', 'FE 35mm F1.4 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL35F14GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL35F14GM.png', 108),
(11, 11, 'achievement', 'FE 35mm F1.8', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL35F18F.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL35F18F.png', 109),
(12, 12, 'achievement', 'FE 50mm F1.2 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50F12GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50F12GM.png', 110),
(13, 13, 'achievement', 'FE 50mm F1.4 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50F14GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50F14GM.png', 111),
(14, 14, 'achievement', 'FE 50mm F2.8 Macro', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50M28.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL50M28.png', 112),
(15, 15, 'achievement', 'FE 85mm F1.4 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL85F14GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL85F14GM.png', 113),
(16, 16, 'achievement', 'FE 85mm F1.4 GM II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL85F14GM2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Prime%20Lens/SEL85F14GM2.png', 114),
(17, 17, 'achievement', 'E 16-55mm F2.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1655G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1655G.png', 201),
(18, 18, 'achievement', 'E 55-210mm F4.5-6.3 OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL55210.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL55210.png', 202),
(19, 19, 'achievement', 'E PZ 18-110mm F4 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP18110G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP18110G.pnghttps://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP18110G.png', 203),
(20, 20, 'achievement', 'FE 16-25mm F2.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1625G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1625G.png', 204),
(21, 21, 'achievement', 'FE 16-35mm F2.8 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635GM.png', 205),
(22, 22, 'achievement', 'FE 16-35mm F2.8 GM II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635GM2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635GM2.png', 206),
(23, 23, 'achievement', 'FE 20-70mm F4 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2070G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2070G.png', 207),
(24, 24, 'achievement', 'FE 24-105mm F4 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL24105G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL24105G.png', 208),
(25, 25, 'achievement', 'FE 24-50mm F2.8 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2450G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2450G.png', 209),
(26, 26, 'achievement', 'FE 24-70mm F2.8 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470GM.png', 210),
(27, 27, 'achievement', 'FE 24-70mm F2.8 GM II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470GM2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470GM2.png', 211),
(28, 28, 'achievement', 'FE 28-70mm F2 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2870GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2870GM.png', 212),
(29, 29, 'achievement', 'FE 50-150 mm.F2 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL50150GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL50150GM.png', 213),
(30, 30, 'achievement', 'FE C 16-35mm T3.1 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELC1635G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELC1635G.png', 214),
(31, 31, 'achievement', 'FE PZ 16-35mm F4 G', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP1635G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP1635G.png', 215),
(32, 32, 'achievement', 'FE PZ 28-135mm F4 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP28135G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SELP28135G.png', 216),
(33, 33, 'achievement', 'Vario-Tessar T* FE 16-35mm F4 ZA OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635Z.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1635Z.png', 217),
(34, 34, 'achievement', 'Vario-Tessar T* FE 24-70mm F4 ZA OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470Z.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL2470Z.png', 218),
(35, 35, 'achievement', 'E 70-350mm F4.5-6.3 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70350G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70350G.png', 301),
(36, 36, 'achievement', 'FE 100-400 mm.F4.5 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL100400MC.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL100400MC.png', 302),
(37, 37, 'achievement', 'FE 100-400mm F4.5-5.6 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL100400GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL100400GM.png', 303),
(38, 38, 'achievement', 'FE 200-600mm F5.6-6.3 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL200600G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL200600G.png', 304),
(39, 39, 'achievement', 'FE 300mm F2.8 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL300F28GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL300F28GM.png', 305),
(40, 40, 'achievement', 'FE 400-800 mm.F6.3-8 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL400800G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL400800G.png', 306),
(41, 41, 'achievement', 'FE 400mm F2.8 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL400F28GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL400F28GM.png', 307),
(42, 42, 'achievement', 'FE 600mm F4 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL600F40GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL600F40GM.png', 308),
(43, 43, 'achievement', 'FE 70-200mm F2.8 GM OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200GM.png', 309),
(44, 44, 'achievement', 'FE 70-200mm F2.8 GM OSS II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200GM2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200GM2.png', 310),
(45, 45, 'achievement', 'FE 70-200mm F4 G OSS', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200G.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200G.png', 311),
(46, 46, 'achievement', 'FE 70-200mm F4 Macro G OSS II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200G2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Telephoto%20%26%20Super%20Telephoto%20Lens/SEL70200G2.png', 312),
(47, 47, 'achievement', 'Alpha 1 II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-1M2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-1M2.png', 401),
(48, 48, 'achievement', 'Alpha 9 III', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-9M3.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-9M3.png', 402),
(49, 49, 'achievement', 'Alpha 7R V', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7RM5.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7RM5.png', 403),
(50, 50, 'achievement', 'Alpha 7 V', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M5.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M5.png', 404),
(51, 51, 'achievement', 'Alpha 7 IV', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M4.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M4.png', 405),
(52, 52, 'achievement', 'Alpha 7 III', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M3.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7M3.png', 406),
(53, 53, 'achievement', 'Alpha 7C II', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7CM2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7CM2.png', 407),
(54, 54, 'achievement', 'Alpha 7C', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7C.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7C.png', 408),
(55, 55, 'achievement', 'Alpha 7CR', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7CR.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7CR.png', 409),
(56, 56, 'achievement', 'Alpha 7S III', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7SM3.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Full%20Frame%20Camera/ILCE-7SM3.png', 410),
(57, 57, 'bronze', 'Portrait Master Bronze', 2, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Bronze.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Bronze.png', 1001),
(58, 57, 'silver', 'Portrait Master Silver', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Silver.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Silver.png', 1002),
(59, 57, 'gold', 'Portrait Master Gold', 4, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Gold.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Portrait-Gold.png', 1003),
(60, 58, 'bronze', 'Wide Architect Bronze', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Bronze.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Bronze.png', 1011),
(61, 58, 'silver', 'Wide Architect Silver', 4, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Silver.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Silver.png', 1012),
(62, 58, 'gold', 'Wide Architect Gold', 5, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Gold.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Wide-Gold.png', 1013),
(63, 59, 'bronze', 'The Visionary Bronze', 2, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Bronze.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Bronze.png', 1021),
(64, 59, 'silver', 'The Visionary Silver', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Silver.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Silver.png', 1022),
(65, 59, 'gold', 'The Visionary Gold', 4, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Gold.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Visionary-Gold.png', 1023),
(66, 60, 'achievement', 'Trinity Master', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Trinity%20Master.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Trinity%20Master.png', 1031),
(67, 61, 'achievement', 'Trinity Junior', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Trinity%20Junior.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/Trinity%20Junior.png', 1041),
(68, 62, 'achievement', 'All Rounder', 3, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/All%20Around.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/All%20Around.png', 1051),
(69, 63, 'achievement', 'F2 Master', 2, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/F2.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/F2.png', 1061),
(70, 64, 'achievement', 'The Magnifier', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Magnifier.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/quest-badge/The%20Magnifier.png', 1071),
(71, 65, 'achievement', 'FE 12-24mm F2.8 GM', 1, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1224GM.png', NULL, 'https://mysonybadgestoragestg.blob.core.windows.net/product-badge/Wide%20%26%20Normal%20Zoom%20Lens/SEL1224GM.png', 219);

INSERT INTO `badge_rules` (`id`, `badge_code`, `badge_name`, `badge_type`, `rule_type`, `display_category`, `display_group`, `display_group_code`, `product_model_code`, `product_url`, `description`, `sort_order`, `is_active`, `active_from`, `active_to`, `registration_start`, `registration_end`) VALUES
(1, 'product-sel100m28gm', 'FE 100 mm.F2.8 Macro GM OSS', 'product', 'achievement', 'Product Badge', 'macro-lens', 'macro-lens', 'SEL100M28GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel100m28gm?sku=sel100m28gmqsyx&cid=cmp-apac-209306&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL100M28GM&utm_term=SEL100M28GM', 'Register SEL100M28GM to unlock this Product Badge.', 1, 1, NULL, NULL, NULL, NULL),
(2, 'product-sel90m28g', 'FE 90mm F2.8 Macro G OSS', 'product', 'achievement', 'Product Badge', 'macro-lens', 'macro-lens', 'SEL90M28G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel90m28g?sku=sel90m28g-qsyx&cid=cmp-apac-209307&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL90M28G&utm_term=SEL90M28G', 'Register SEL90M28G to unlock this Product Badge.', 2, 1, NULL, NULL, NULL, NULL),
(3, 'product-sel30m35', 'E 30mm F3.5 Macro', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL30M35', 'https://www.sony.co.th/th/electronics/camera-lenses/sel30m35?sku=sel30m35-c-syx&cid=cmp-apac-209308&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL30M35&utm_term=SEL30M35', 'Register SEL30M35 to unlock this Product Badge.', 101, 1, NULL, NULL, NULL, NULL),
(4, 'product-sel135f18gm', 'FE 135mm F1.8 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL135F18GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel135f18gm?sku=sel135f18gm-syx&cid=cmp-apac-209309&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL135F18GM&utm_term=SEL135F18GM', 'Register SEL135F18GM to unlock this Product Badge.', 102, 1, NULL, NULL, NULL, NULL),
(5, 'product-sel14f18gm', 'FE 14mm F1.8 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL14F18GM', 'https://www.sony.co.th/th/lenses/products/sel14f18gm?cid=cmp-apac-209310&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL14F18GM&utm_term=SEL14F18GM', 'Register SEL14F18GM to unlock this Product Badge.', 103, 1, NULL, NULL, NULL, NULL),
(6, 'product-sel16f18g', 'FE 16mm F1.8 G', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL16F18G', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209311&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL16F18G&utm_term=SEL16F18G', 'Register SEL16F18G to unlock this Product Badge.', 104, 1, NULL, NULL, NULL, NULL),
(7, 'product-sel20f18g', 'FE 20mm F1.8 G', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL20F18G', 'https://www.sony.co.th/th/lenses/products/sel20f18g?cid=cmp-apac-209312&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL20F18G&utm_term=SEL20F18G', 'Register SEL20F18G to unlock this Product Badge.', 105, 1, NULL, NULL, NULL, NULL),
(8, 'product-sel24f14gm', 'FE 24mm F1.4 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL24F14GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel24f14gm?sku=sel24f14gm-syx&cid=cmp-apac-209313&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL24F14GM&utm_term=SEL24F14GM', 'Register SEL24F14GM to unlock this Product Badge.', 106, 1, NULL, NULL, NULL, NULL),
(9, 'product-sel24f28g', 'FE 24mm F2.8 G', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL24F28G', 'https://www.sony.co.th/th/lenses/products/sel24f28g?cid=cmp-apac-209314&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL24F28G&utm_term=SEL24F28G', 'Register SEL24F28G to unlock this Product Badge.', 107, 1, NULL, NULL, NULL, NULL),
(10, 'product-sel35f14gm', 'FE 35mm F1.4 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL35F14GM', 'https://www.sony.co.th/th/lenses/products/sel35f14gm?cid=cmp-apac-209315&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL35F14GM&utm_term=SEL35F14GM', 'Register SEL35F14GM to unlock this Product Badge.', 108, 1, NULL, NULL, NULL, NULL),
(11, 'product-sel35f18f', 'FE 35mm F1.8', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL35F18F', 'https://www.sony.co.th/th/electronics/camera-lenses/sel35f18f?sku=sel35f18f-csyx&cid=cmp-apac-209316&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL35F18F&utm_term=SEL35F18F', 'Register SEL35F18F to unlock this Product Badge.', 109, 1, NULL, NULL, NULL, NULL),
(12, 'product-sel50f12gm', 'FE 50mm F1.2 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL50F12GM', 'https://www.sony.co.th/th/lenses/products/sel50f12gm?cid=cmp-apac-209317&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL50F12GM&utm_term=SEL50F12GM', 'Register SEL50F12GM to unlock this Product Badge.', 110, 1, NULL, NULL, NULL, NULL),
(13, 'product-sel50f14gm', 'FE 50mm F1.4 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL50F14GM', 'https://www.sony.co.th/th/lenses/products/sel50f14gm?cid=cmp-apac-209318&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL50F14GM&utm_term=SEL50F14GM', 'Register SEL50F14GM to unlock this Product Badge.', 111, 1, NULL, NULL, NULL, NULL),
(14, 'product-sel50m28', 'FE 50mm F2.8 Macro', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL50M28', 'https://www.sony.co.th/th/electronics/camera-lenses/sel50m28?sku=sel50m28-c-syx&cid=cmp-apac-209319&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL50M28&utm_term=SEL50M28', 'Register SEL50M28 to unlock this Product Badge.', 112, 1, NULL, NULL, NULL, NULL),
(15, 'product-sel85f14gm', 'FE 85mm F1.4 GM', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL85F14GM', 'https://www.sony.co.th/th/lenses/products/sel85f14gm2?cid=cmp-apac-209320&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL85F14GM&utm_term=SEL85F14GM', 'Register SEL85F14GM to unlock this Product Badge.', 113, 1, NULL, NULL, NULL, NULL),
(16, 'product-sel85f14gm2', 'FE 85mm F1.4 GM II', 'product', 'achievement', 'Product Badge', 'prime-lens', 'prime-lens', 'SEL85F14GM2', 'https://www.sony.co.th/th/lenses/products/sel85f14gm2?cid=cmp-apac-209321&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL85F14GM2&utm_term=SEL85F14GM2', 'Register SEL85F14GM2 to unlock this Product Badge.', 114, 1, NULL, NULL, NULL, NULL),
(17, 'product-sel1655g', 'E 16-55mm F2.8 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1655G', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209322&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL1655G&utm_term=SEL1655G', 'Register SEL1655G to unlock this Product Badge.', 201, 1, NULL, NULL, NULL, NULL),
(18, 'product-sel55210', 'E 55-210mm F4.5-6.3 OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL55210', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209323&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL55210&utm_term=SEL55210', 'Register SEL55210 to unlock this Product Badge.', 202, 1, NULL, NULL, NULL, NULL),
(19, 'product-selp18110g', 'E PZ 18-110mm F4 G OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SELP18110G', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209324&utm_source=Line&utm_campaign=F26_Digital-Badge_SELP18110G&utm_term=SELP18110G', 'Register SELP18110G to unlock this Product Badge.', 203, 1, NULL, NULL, NULL, NULL),
(20, 'product-sel1625g', 'FE 16-25mm F2.8 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1625G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel1625g?sku=sel1625g-z-syx&cid=cmp-apac-209325&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL1625G&utm_term=SEL1625G', 'Register SEL1625G to unlock this Product Badge.', 204, 1, NULL, NULL, NULL, NULL),
(21, 'product-sel1635gm', 'FE 16-35mm F2.8 GM', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1635GM', 'https://www.sony.co.th/th/lenses/products/sel1635gm2?cid=cmp-apac-209326&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL1635GM&utm_term=SEL1635GM', 'Register SEL1635GM to unlock this Product Badge.', 205, 1, NULL, NULL, NULL, NULL),
(22, 'product-sel1635gm2', 'FE 16-35mm F2.8 GM II', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1635GM2', 'https://www.sony.co.th/th/lenses/products/sel1635gm2?cid=cmp-apac-209327&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL1635GM2&utm_term=SEL1635GM2', 'Register SEL1635GM2 to unlock this Product Badge.', 206, 1, NULL, NULL, NULL, NULL),
(23, 'product-sel2070g', 'FE 20-70mm F4 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2070G', 'https://www.sony.co.th/th/lenses/products/sel2070g?cid=cmp-apac-209328&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2070G&utm_term=SEL2070G', 'Register SEL2070G to unlock this Product Badge.', 207, 1, NULL, NULL, NULL, NULL),
(24, 'product-sel24105g', 'FE 24-105mm F4 G OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL24105G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel24105g?sku=sel24105g-syx&cid=cmp-apac-209329&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL24105G&utm_term=SEL24105G', 'Register SEL24105G to unlock this Product Badge.', 208, 1, NULL, NULL, NULL, NULL),
(25, 'product-sel2450g', 'FE 24-50mm F2.8 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2450G', 'https://www.sony.co.th/th/lenses/products/sel2450g?cid=cmp-apac-209330&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2450G&utm_term=SEL2450G', 'Register SEL2450G to unlock this Product Badge.', 209, 1, NULL, NULL, NULL, NULL),
(26, 'product-sel2470gm', 'FE 24-70mm F2.8 GM', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2470GM', 'https://www.sony.co.th/th/lenses/products/sel2470gm2?cid=cmp-apac-209331&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2470GM&utm_term=SEL2470GM', 'Register SEL2470GM to unlock this Product Badge.', 210, 1, NULL, NULL, NULL, NULL),
(27, 'product-sel2470gm2', 'FE 24-70mm F2.8 GM II', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2470GM2', 'https://www.sony.co.th/th/lenses/products/sel2470gm2?cid=cmp-apac-209332&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2470GM2&utm_term=SEL2470GM2', 'Register SEL2470GM2 to unlock this Product Badge.', 211, 1, NULL, NULL, NULL, NULL),
(28, 'product-sel2870gm', 'FE 28-70mm F2 GM', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2870GM', 'https://www.sony.co.th/th/electronics/e-mount-lenses/sel2870gm?sku=sel2870gm-qsyx&cid=cmp-apac-209333&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2870GM&utm_term=SEL2870GM', 'Register SEL2870GM to unlock this Product Badge.', 212, 1, NULL, NULL, NULL, NULL),
(29, 'product-sel50150gm', 'FE 50-150 mm.F2 GM', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL50150GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel50150gm?cid=cmp-apac-209334&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL50150GM&utm_term=SEL50150GM', 'Register SEL50150GM to unlock this Product Badge.', 213, 1, NULL, NULL, NULL, NULL),
(30, 'product-selc1635g', 'FE C 16-35mm T3.1 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SELC1635G', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209335&utm_source=Line&utm_campaign=F26_Digital-Badge_SELC1635G&utm_term=SELC1635G', 'Register SELC1635G to unlock this Product Badge.', 214, 1, NULL, NULL, NULL, NULL),
(31, 'product-selp1635g', 'FE PZ 16-35mm F4 G', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SELP1635G', 'https://www.sony.co.th/th/lenses/products/selp1635g?cid=cmp-apac-209336&utm_source=Line&utm_campaign=F26_Digital-Badge_SELP1635G&utm_term=SELP1635G', 'Register SELP1635G to unlock this Product Badge.', 215, 1, NULL, NULL, NULL, NULL),
(32, 'product-selp28135g', 'FE PZ 28-135mm F4 G OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SELP28135G', 'https://www.sony.co.th/th/electronics/camera-lenses/selp28135g?sku=selp28135g-syx&cid=cmp-apac-209337&utm_source=Line&utm_campaign=F26_Digital-Badge_SELP28135G&utm_term=SELP28135G', 'Register SELP28135G to unlock this Product Badge.', 216, 1, NULL, NULL, NULL, NULL),
(33, 'product-sel1635z', 'Vario-Tessar T* FE 16-35mm F4 ZA OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1635Z', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209338&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL1635Z&utm_term=SEL1635Z', 'Register SEL1635Z to unlock this Product Badge.', 217, 1, NULL, NULL, NULL, NULL),
(34, 'product-sel2470z', 'Vario-Tessar T* FE 24-70mm F4 ZA OSS', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL2470Z', 'https://www.sony.co.th/th/lenses?cid=cmp-apac-209339&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL2470Z&utm_term=SEL2470Z', 'Register SEL2470Z to unlock this Product Badge.', 218, 1, NULL, NULL, NULL, NULL),
(35, 'product-sel70350g', 'E 70-350mm F4.5-6.3 G OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL70350G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel70350g?sku=sel70350g-csyx&cid=cmp-apac-209340&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL70350G&utm_term=SEL70350G', 'Register SEL70350G to unlock this Product Badge.', 301, 1, NULL, NULL, NULL, NULL),
(36, 'product-sel100400mc', 'FE 100-400 mm.F4.5 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL100400MC', 'https://www.sony.co.th/th/electronics/camera-lenses/sel100400mc?sku=sel100400mcqsyx&cid=cmp-apac-209341&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL100400MC&utm_term=SEL100400MC', 'Register SEL100400MC to unlock this Product Badge.', 302, 1, NULL, NULL, NULL, NULL),
(37, 'product-sel100400gm', 'FE 100-400mm F4.5-5.6 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL100400GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel100400gm?sku=sel100400gm-syx&cid=cmp-apac-209342&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL100400GM&utm_term=SEL100400GM', 'Register SEL100400GM to unlock this Product Badge.', 303, 1, NULL, NULL, NULL, NULL),
(38, 'product-sel200600g', 'FE 200-600mm F5.6-6.3 G OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL200600G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel200600g?sku=sel200600g-csyx&cid=cmp-apac-209343&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL200600G&utm_term=SEL200600G', 'Register SEL200600G to unlock this Product Badge.', 304, 1, NULL, NULL, NULL, NULL),
(39, 'product-sel300f28gm', 'FE 300mm F2.8 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL300F28GM', 'https://www.sony.co.th/th/lenses/products/sel300f28gm?cid=cmp-apac-209344&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL300F28GM&utm_term=SEL300F28GM', 'Register SEL300F28GM to unlock this Product Badge.', 305, 1, NULL, NULL, NULL, NULL),
(40, 'product-sel400800g', 'FE 400-800 mm.F6.3-8 G OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL400800G', 'https://www.sony.co.th/th/electronics/camera-lenses/sel400800g?sku=sel400800g-csyx&cid=cmp-apac-209345&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL400800G&utm_term=SEL400800G', 'Register SEL400800G to unlock this Product Badge.', 306, 1, NULL, NULL, NULL, NULL),
(41, 'product-sel400f28gm', 'FE 400mm F2.8 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL400F28GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel400f28gm?sku=sel400f28gm-syx&cid=cmp-apac-209346&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL400F28GM&utm_term=SEL400F28GM', 'Register SEL400F28GM to unlock this Product Badge.', 307, 1, NULL, NULL, NULL, NULL),
(42, 'product-sel600f40gm', 'FE 600mm F4 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL600F40GM', 'https://www.sony.co.th/th/electronics/camera-lenses/sel600f40gm?sku=sel600f40gm-syx&cid=cmp-apac-209347&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL600F40GM&utm_term=SEL600F40GM', 'Register SEL600F40GM to unlock this Product Badge.', 308, 1, NULL, NULL, NULL, NULL),
(43, 'product-sel70200gm', 'FE 70-200mm F2.8 GM OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL70200GM', 'https://www.sony.co.th/th/lenses/products/sel70200gm2?locale=th_TH&sku=sel70200gm2qsyx&cid=cmp-apac-209348&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL70200GM&utm_term=SEL70200GM', 'Register SEL70200GM to unlock this Product Badge.', 309, 1, NULL, NULL, NULL, NULL),
(44, 'product-sel70200gm2', 'FE 70-200mm F2.8 GM OSS II', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL70200GM2', 'https://www.sony.co.th/th/lenses/products/sel70200gm2?locale=th_TH&sku=sel70200gm2qsyx&cid=cmp-apac-209349&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL70200GM2&utm_term=SEL70200GM2', 'Register SEL70200GM2 to unlock this Product Badge.', 310, 1, NULL, NULL, NULL, NULL),
(45, 'product-sel70200g', 'FE 70-200mm F4 G OSS', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL70200G', 'https://www.sony.co.th/th/lenses/products/sel70200g2?sku=sel70200g2-csyx&cid=cmp-apac-209350&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL70200G&utm_term=SEL70200G', 'Register SEL70200G to unlock this Product Badge.', 311, 1, NULL, NULL, NULL, NULL),
(46, 'product-sel70200g2', 'FE 70-200mm F4 Macro G OSS II', 'product', 'achievement', 'Product Badge', 'telephoto-super-telephoto-lens', 'telephoto-super-telephoto-lens', 'SEL70200G2', 'https://www.sony.co.th/th/lenses/products/sel70200g2?sku=sel70200g2-csyx&cid=cmp-apac-209351&utm_source=Line&utm_campaign=F26_Digital-Badge_SEL70200G2&utm_term=SEL70200G2', 'Register SEL70200G2 to unlock this Product Badge.', 312, 1, NULL, NULL, NULL, NULL),
(47, 'product-ilce-1m2', 'Alpha 1 II', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-1M2', 'https://www.sony.co.th/th/electronics/interchangeable-lens-cameras/ilce-1m2?cid=cmp-apac-209352&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-1M2&utm_term=ILCE-1M2', 'Register ILCE-1M2 to unlock this Product Badge.', 401, 1, NULL, NULL, NULL, NULL),
(48, 'product-ilce-9m3', 'Alpha 9 III', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-9M3', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-9m3?sku=ilce-9m3-bq-ap2&cid=cmp-apac-209353&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-9M3&utm_term=ILCE-9M3', 'Register ILCE-9M3 to unlock this Product Badge.', 402, 1, NULL, NULL, NULL, NULL),
(49, 'product-ilce-7rm5', 'Alpha 7R V', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7RM5', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7rm5?sku=ilce-7rm5-bqap2&cid=cmp-apac-209354&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7RM5&utm_term=ILCE-7RM5', 'Register ILCE-7RM5 to unlock this Product Badge.', 403, 1, NULL, NULL, NULL, NULL),
(50, 'product-ilce-7m5', 'Alpha 7 V', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7M5', 'https://www.sony.co.th/th/electronics/interchangeable-lens-cameras/ilce-7m5?cid=cmp-apac-209355&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7M5&utm_term=ILCE-7M5', 'Register ILCE-7M5 to unlock this Product Badge.', 404, 1, NULL, NULL, NULL, NULL),
(51, 'product-ilce-7m4', 'Alpha 7 IV', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7M4', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7m4?sku=ilce-7m4-bq-ap2&cid=cmp-apac-209356&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7M4&utm_term=ILCE-7M4', 'Register ILCE-7M4 to unlock this Product Badge.', 405, 1, NULL, NULL, NULL, NULL),
(52, 'product-ilce-7m3', 'Alpha 7 III', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7M3', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7m3-body-kit?sku=ilce-7m3-bq-ap2&cid=cmp-apac-209357&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7M3&utm_term=ILCE-7M3', 'Register ILCE-7M3 to unlock this Product Badge.', 406, 1, NULL, NULL, NULL, NULL),
(53, 'product-ilce-7cm2', 'Alpha 7C II', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7CM2', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7cm2?cid=cmp-apac-209358&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7CM2&utm_term=ILCE-7CM2', 'Register ILCE-7CM2 to unlock this Product Badge.', 407, 1, NULL, NULL, NULL, NULL),
(54, 'product-ilce-7c', 'Alpha 7C', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7C', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7c?locale=th_TH&sku=ilce-7c-sq-ap2&cid=cmp-apac-209359&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7C&utm_term=ILCE-7C', 'Register ILCE-7C to unlock this Product Badge.', 408, 1, NULL, NULL, NULL, NULL),
(55, 'product-ilce-7cr', 'Alpha 7CR', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7CR', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7cr?sku=ilce-7cr-bq-ap2&cid=cmp-apac-209360&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7CR&utm_term=ILCE-7CR', 'Register ILCE-7CR to unlock this Product Badge.', 409, 1, NULL, NULL, NULL, NULL),
(56, 'product-ilce-7sm3', 'Alpha 7S III', 'product', 'achievement', 'Product Badge', 'full-frame-camera', 'full-frame-camera', 'ILCE-7SM3', 'https://www.sony.co.th/th/interchangeable-lens-cameras/products/ilce-7sm3?cid=cmp-apac-209361&utm_source=Line&utm_campaign=F26_Digital-Badge_ILCE-7SM3&utm_term=ILCE-7SM3', 'Register ILCE-7SM3 to unlock this Product Badge.', 410, 1, NULL, NULL, NULL, NULL),
(57, 'portrait-master', 'Portrait Master', 'quest', 'tier', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Collect unique eligible Portrait Master models.', 1000, 1, NULL, NULL, NULL, NULL),
(58, 'wide-architect', 'Wide Architect', 'quest', 'tier', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Collect unique eligible Wide Architect models.', 1010, 1, NULL, NULL, NULL, NULL),
(59, 'the-visionary', 'The Visionary', 'quest', 'tier', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Collect unique eligible The Visionary models.', 1020, 1, NULL, NULL, NULL, NULL),
(60, 'trinity-master', 'Trinity Master', 'quest', 'achievement', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Own one model from each required G Master family.', 1030, 1, NULL, NULL, NULL, NULL),
(61, 'trinity-junior', 'Trinity Junior', 'quest', 'achievement', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Own all three required Trinity Junior models.', 1040, 1, NULL, NULL, NULL, NULL),
(62, 'all-rounder', 'All Rounder', 'quest', 'achievement', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Own any three eligible All Rounder models.', 1050, 1, NULL, NULL, NULL, NULL),
(63, 'f2-master', 'F2 Master', 'quest', 'achievement', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Own both required F2 Master models.', 1060, 1, NULL, NULL, NULL, NULL),
(64, 'the-magnifier', 'The Magnifier', 'quest', 'achievement', 'Quest Badge', 'quest', 'quest', NULL, NULL, 'Own any one eligible macro model.', 1070, 1, NULL, NULL, NULL, NULL),
(65, 'product-sel1224gm', 'FE 12-24mm F2.8 GM', 'product', 'achievement', 'Product Badge', 'wide-normal-zoom-lens', 'wide-normal-zoom-lens', 'SEL1224GM', 'https://www.sony.co.th/th/lenses/products/sel1224gm?srsltid=AfmBOop3Wm03Q1yX1Qkbi35DFvtZsS5Pnp30j8XKukreMyp3yesB25l0', 'Register SEL1224GM to unlock this Product Badge.', 219, 1, NULL, NULL, NULL, NULL);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;