import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { groupPortalProducts } from "@/lib/cs-portal/product-groups";
import type { PortalDataset } from "@/lib/cs-portal/types";
import {
  canonicalSku,
  normalizeSku,
  resolveCanonicalModelKey,
} from "@/lib/sku";

type ModelNamesFixture = {
  modelNames: string[];
};

type WorkbookFixture = {
  products: Array<{
    external_key: string | null;
    model_name: string;
    model_key: string;
    category_code: string | null;
    image_url: string | null;
    sort_order: number;
  }>;
};

const fixturesDir = resolve(
  process.cwd(),
  "scripts/db/cs-portal/fixtures",
);

const modelNamesFixture = JSON.parse(
  readFileSync(
    resolve(fixturesDir, "mobile-game-mapping-model-names.json"),
    "utf8",
  ),
) as ModelNamesFixture;

const workbook = JSON.parse(
  readFileSync(resolve(fixturesDir, "workbook-uat.json"), "utf8"),
) as WorkbookFixture;

const catalogKeys = workbook.products.map((product) => product.model_key);
const dataset: PortalDataset = {
  products: workbook.products,
  contents: [],
};

const columnBNames = modelNamesFixture.modelNames;

describe("Mobile & Game Mapping Column B Model_Name", () => {
  it("loads the Column B fixture", () => {
    expect(columnBNames.length).toBeGreaterThan(0);
    expect(columnBNames).toHaveLength(60);
  });

  it.each(columnBNames)(
    "catalog contains Column B model %s",
    (modelName) => {
      expect(catalogKeys).toContain(normalizeSku(modelName));
    },
  );

  it.each(columnBNames)(
    "resolveCanonicalModelKey(%s) returns the same catalog key",
    (modelName) => {
      expect(resolveCanonicalModelKey(modelName, catalogKeys)).toBe(
        normalizeSku(modelName),
      );
    },
  );

  it.each(columnBNames)(
    "portal groups Sony ModelName %s to that catalog key",
    (modelName) => {
      const groups = groupPortalProducts(
        [
          {
            sku: canonicalSku(modelName),
            modelName,
            serialNumber: "TEST-SERIAL",
            registeredAt: "2026-01-01",
            warrantyExpiryDate: "2027-01-01",
          },
        ],
        dataset,
      );

      expect(groups).toHaveLength(1);
      expect(groups[0]).toMatchObject({
        modelKey: normalizeSku(modelName),
        matchedCatalog: true,
      });
    },
  );
});
