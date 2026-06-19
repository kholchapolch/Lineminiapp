import { normalizeSku } from "@/lib/sku";

const skuLabels: Record<string, string> = {
  "ILCE-1M2": "Key full-frame body SKU",
  "ILCE-9M3": "Key full-frame body SKU",
  "ILCE-7RM5": "Key full-frame body SKU",
  "ILCE-7M5": "Key full-frame body SKU",
  "ILCE-7CM2": "Key full-frame body SKU",
  OTHER_FF: "Other full-frame body",
  SEL2470GM2: "Key GM lens SKU",
  SEL1635GM2: "Key GM lens SKU",
  SEL70200GM2: "Key GM lens SKU",
  SEL50F12GM: "Key GM lens SKU",
  SEL50F14GM: "Key GM lens SKU",
  SEL35F14GM: "Key GM lens SKU",
  SEL50150F2GM: "Premium F2 GM lens SKU",
  SEL2870F2GM: "Premium F2 GM lens SKU",
  OTHER_GM_LENS: "Other GM lens",
  SEL85F14GM2: "Portrait GM lens SKU",
  SEL135F18GM: "Portrait GM lens SKU",
  SEL14F18GM: "Wide travel lens SKU",
  SEL16F18G: "Wide travel lens SKU",
  SEL20F18G: "Wide travel lens SKU",
  SEL2450G: "Travel G lens SKU",
  SEL400800G: "Wildlife lens SKU",
  SEL200600G: "Wildlife lens SKU",
  SEL300F28GM: "Wildlife lens SKU",
  SEL400F28GM: "Wildlife lens SKU",
  SEL600F28GM: "Wildlife lens SKU",
  SEL1625G: "G trinity lens SKU",
  SEL70200G2: "G trinity lens SKU",
  SEL90M28G: "Macro lens SKU",
  SEL50M28: "Macro lens SKU",
  "SHARED-TIER-01": "Shared tier demo SKU",
};

export function getReadableSkuLabel(sku: string): string {
  const normalizedSku = normalizeSku(sku);
  const generatedLabel = generatedTierLabel(normalizedSku);
  const label = skuLabels[normalizedSku] ?? generatedLabel;

  return label ? `${normalizedSku} - ${label}` : normalizedSku;
}

function generatedTierLabel(sku: string): string | null {
  const match = /^(BODY|GM)-SKU-(\d{2})$/.exec(sku);

  if (!match) {
    return null;
  }

  const [, group, number] = match;
  return group === "BODY"
    ? `Body tier demo product ${number}`
    : `GM tier demo product ${number}`;
}
