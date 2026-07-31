import type { SonyCustomerProducts } from "@/types/badge";
import { getMockProductsFromLineUuid } from "@/lib/sku-mock";

export class SonyCustomerNotFoundError extends Error {
  code = "CUSTOMER_NOT_FOUND";
  safeMessage = "Customer profile was not found.";

  constructor() {
    super("Sony customer profile was not found.");
    this.name = "SonyCustomerNotFoundError";
  }
}

const mockCustomers: Record<string, SonyCustomerProducts> = {
  "demo-line-earned": {
    customer: {
      lineuuid: "demo-line-earned",
      customerId: "demo-earned",
      displayName: "Nicha Wong",
      lineDisplayName: "Nicha",
      linePictureUrl: null,
    },
    products: [
      {
        sku: "ILCE-7RM5",
        modelName: "Alpha 7R V",
        serialNumber: "SN-A7M4-001",
        registeredAt: "2026-05-20",
      },
      {
        sku: "SEL1635GM2",
        modelName: "FE 16-35mm F2.8 GM II",
        serialNumber: "SN-LENS-000",
        registeredAt: "2026-05-20",
      },
      {
        sku: "SEL35F14GM",
        modelName: "FE 35mm F1.4 GM",
        serialNumber: "SN-LENS-001",
        registeredAt: "2026-05-21",
      },
      {
        sku: "SEL2470GM2",
        modelName: "FE 24-70mm F2.8 GM II",
        serialNumber: "SN-LENS-002",
        registeredAt: "2026-05-22",
      },
      {
        sku: "SEL70200GM2",
        modelName: "FE 70-200mm F2.8 GM OSS II",
        serialNumber: "SN-LENS-003",
        registeredAt: "2026-05-23",
      },
      {
        sku: "SEL90M28G",
        modelName: "FE 90mm F2.8 Macro G OSS",
        serialNumber: "SN-MACRO-001",
        registeredAt: "2026-05-24",
      },
      {
        sku: "SEL100400GM",
        modelName: "FE 100-400mm F4.5-5.6 GM OSS",
        serialNumber: "SN-VISIONARY-001",
        registeredAt: "2026-05-25",
      },
      {
        sku: "SEL2070G",
        modelName: "FE 20-70mm F4 G",
        serialNumber: "SN-ALLROUNDER-001",
        registeredAt: "2026-05-26",
      },
      {
        sku: "SELP1635G",
        modelName: "FE PZ 16-35mm F4 G",
        serialNumber: "SN-ALLROUNDER-002",
        registeredAt: "2026-05-27",
      },
      {
        sku: "SEL70200G",
        modelName: "FE 70-200mm F4 G OSS",
        serialNumber: "SN-ALLROUNDER-003",
        registeredAt: "2026-05-28",
      },
      {
        sku: "SEL2870GM",
        modelName: "FE 28-70mm F2 GM",
        serialNumber: "SN-F2-001",
        registeredAt: "2026-05-29",
      },
      {
        sku: "SEL50150GM",
        modelName: "FE 50-150mm F2 GM",
        serialNumber: "SN-F2-002",
        registeredAt: "2026-05-30",
      },
      ...mixedTierProducts(),
    ],
  },
  "demo-line-tier-bronze": {
    customer: {
      lineuuid: "demo-line-tier-bronze",
      customerId: "demo-tier-bronze",
      displayName: "Ben Bronze",
      lineDisplayName: "Ben",
      linePictureUrl: null,
    },
    products: sharedTierProducts(1),
  },
  "demo-line-tier-silver": {
    customer: {
      lineuuid: "demo-line-tier-silver",
      customerId: "demo-tier-silver",
      displayName: "Sai Silver",
      lineDisplayName: "Sai",
      linePictureUrl: null,
    },
    products: bodyTierProducts(5),
  },
  "demo-line-tier-gold": {
    customer: {
      lineuuid: "demo-line-tier-gold",
      customerId: "demo-tier-gold",
      displayName: "Gorn Gold",
      lineDisplayName: "Gorn",
      linePictureUrl: null,
    },
    products: [...bodyTierProducts(10), ...gmTierProducts(10).slice(1)],
  },
  "demo-line-tier-body-silver-gm-gold": {
    customer: {
      lineuuid: "demo-line-tier-body-silver-gm-gold",
      customerId: "demo-tier-body-silver-gm-gold",
      displayName: "Mina Mixed Tier",
      lineDisplayName: "Mina",
      linePictureUrl: null,
    },
    products: mixedTierProducts(),
  },
  "demo-line-sony-warranty-contract": {
    customer: {
      lineuuid: "demo-line-sony-warranty-contract",
      customerId: "demo-sony-warranty-contract",
      displayName: "Sony Warranty Contract Sample",
      lineDisplayName: "Sony Demo",
      linePictureUrl: null,
    },
    products: [
      {
        sku: "ZV-E10M2/BQ AP2",
        modelName: "ZV-E10M2/BQ AP2",
        serialNumber: "1000003",
        registeredAt: "2026-03-25",
      },
      {
        sku: "SEL70200GM2QSYX",
        modelName: "SEL70200GM2QSYX",
        serialNumber: "2000004",
        registeredAt: "2026-03-25",
      },
    ],
  },
  "demo-line-locked": {
    customer: {
      lineuuid: "demo-line-locked",
      customerId: "demo-locked",
      displayName: "Krit Tan",
      lineDisplayName: "Krit",
      linePictureUrl: null,
    },
    products: [
      {
        sku: "ILCE-7CM2",
        modelName: "Alpha 7C II",
        serialNumber: "SN-A7M4-LOCKED",
        registeredAt: "2026-05-20",
      },
    ],
  },
  "demo-line-missing-data": {
    customer: {
      lineuuid: "demo-line-missing-data",
      customerId: "demo-missing-data",
      displayName: "Anon Sony",
      lineDisplayName: "Anon",
      linePictureUrl: null,
    },
    products: [
      {
        sku: "ILCE-7CM2",
        modelName: null,
        serialNumber: null,
        registeredAt: "2026-05-20",
      },
    ],
  },
  "demo-line-empty": {
    customer: {
      lineuuid: "demo-line-empty",
      customerId: "demo-empty",
      displayName: "Mali Chai",
      lineDisplayName: "Mali",
      linePictureUrl: null,
    },
    products: [],
  },
};

function sharedTierProducts(count: number): SonyCustomerProducts["products"] {
  if (count <= 0) {
    return [];
  }

  return [
    {
      sku: "SHARED-TIER-01",
      modelName: "Shared Tier Demo Product 01",
      serialNumber: "SN-SHARED-TIER-01",
      registeredAt: "2026-06-01",
    },
  ];
}

function bodyTierProducts(count: number): SonyCustomerProducts["products"] {
  return tierProducts({
    count,
    prefix: "BODY",
    sharedName: "Shared Tier Demo Product 01",
    modelPrefix: "Body Tier Demo Product",
  });
}

function gmTierProducts(count: number): SonyCustomerProducts["products"] {
  return tierProducts({
    count,
    prefix: "GM",
    sharedName: "Shared Tier Demo Product 01",
    modelPrefix: "GM Tier Demo Product",
  });
}

function mixedTierProducts(): SonyCustomerProducts["products"] {
  return [...bodyTierProducts(5), ...gmTierProducts(10).slice(1)];
}

function tierProducts({
  count,
  prefix,
  sharedName,
  modelPrefix,
}: {
  count: number;
  prefix: string;
  sharedName: string;
  modelPrefix: string;
}): SonyCustomerProducts["products"] {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const position = index + 1;
    const suffix = String(position).padStart(2, "0");
    const shared = position === 1;

    return {
      sku: shared ? "SHARED-TIER-01" : `${prefix}-SKU-${suffix}`,
      modelName: shared ? sharedName : `${modelPrefix} ${suffix}`,
      serialNumber: shared ? "SN-SHARED-TIER-01" : `SN-${prefix}-TIER-${suffix}`,
      registeredAt: `2026-06-${String(Math.min(position, 28)).padStart(2, "0")}`,
    };
  });
}

export async function getMockSonyCustomerProducts(
  lineuuid: string,
): Promise<SonyCustomerProducts> {
  const customerProducts = getMockProductsFromLineUuid(lineuuid) ?? mockCustomers[lineuuid];

  if (!customerProducts) {
    throw new SonyCustomerNotFoundError();
  }

  return customerProducts;
}
