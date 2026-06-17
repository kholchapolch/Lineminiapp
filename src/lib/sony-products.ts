import type { SonyCustomerProducts } from "@/types/badge";

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
        sku: "ILCE-7M4",
        modelName: "Alpha 7 IV",
        serialNumber: "SN-A7M4-001",
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
        sku: "ILCE-7M4",
        modelName: "Alpha 7 IV",
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
        sku: "ILCE-7M4",
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

export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

export async function getMockSonyCustomerProducts(
  lineuuid: string,
): Promise<SonyCustomerProducts> {
  const customerProducts = mockCustomers[lineuuid];

  if (!customerProducts) {
    throw new SonyCustomerNotFoundError();
  }

  return customerProducts;
}
