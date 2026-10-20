import { describe, expect, it } from "vitest";
import { resolveCanonicalModelKey } from "@/lib/sku";

const cameraCatalog = ["ILCE-7C", "ILCE-7CM2", "ILCE-7CR", "ILCE-7M5"];

describe("resolveCanonicalModelKey", () => {
  it("picks the longest catalog prefix like My Badges resolveCatalogSku", () => {
    expect(resolveCanonicalModelKey("ILCE-7CM2LSQAP2", cameraCatalog)).toBe(
      "ILCE-7CM2",
    );
    expect(resolveCanonicalModelKey("ILCE-7CM2/LS QAP2", cameraCatalog)).toBe(
      "ILCE-7CM2",
    );
    expect(resolveCanonicalModelKey("ILCE-7C/BQ AP2", cameraCatalog)).toBe(
      "ILCE-7C",
    );
  });

  it("returns the longest key when the model name embeds a shorter catalog key", () => {
    expect(
      resolveCanonicalModelKey(" abc/qsyx ", ["ABC", "ABC/QSYX"]),
    ).toBe("ABC/QSYX");
    expect(
      resolveCanonicalModelKey("ABC//Z SYX", ["ABC", "ABC/"]),
    ).toBe("ABC/");
  });

  it("returns null for blank or unknown model names", () => {
    expect(resolveCanonicalModelKey("   ", ["ABC"])).toBeNull();
    expect(resolveCanonicalModelKey("XYZ", ["ABC"])).toBeNull();
  });
});
