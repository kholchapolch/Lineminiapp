import { createNoProductState } from './no-product-state';
import type { AppConfig } from '@/lib/app-config';
import { createSonyProductsClient } from '@/lib/sony-products-client';
import {
  isSonyCustomerNotFound,
  isSonyProductsBusinessEmpty,
  createSonyAccountPlaceholder,
  type SonyAccountPlaceholder,
} from '@/lib/sony-account';

export class PortalProductsUnavailableError extends Error {}
export type PortalOwnedProduct = {
  sku: string; modelName: string | null; serialNumber: string | null;
  registeredAt: string | null; warrantyExpiryDate: string | null;
};
export type PortalProductsResponse = {
  accountStatus: 'linked' | 'not_linked';
  productState: 'has_products' | 'no_products' | 'not_applicable';
  isMock: boolean;
  products: PortalOwnedProduct[];
  placeholder?: SonyAccountPlaceholder;
  emptyState?: ReturnType<typeof createNoProductState>;
};
const nullable = (value: string | null | undefined) => value?.trim() ? value : null;

export async function getPortalProducts(config: AppConfig, lineuuid: string): Promise<PortalProductsResponse> {
  const isMock = config.sonyProductApiMode === 'mock';
  try {
    const result = await createSonyProductsClient(config, { allowMissingRegistrationDate: true, timeoutMs: 10000 }).getCustomerProducts(lineuuid);
    if (result.customer.lineuuid !== lineuuid) throw new Error('Mismatched owner');
    return {
      ...(result.products.length === 0 ? { emptyState: createNoProductState() } : {}),
      accountStatus: 'linked', productState: result.products.length ? 'has_products' : 'no_products', isMock,
      products: result.products.map(product => ({
        sku: product.sku, modelName: nullable(product.modelName), serialNumber: nullable(product.serialNumber),
        registeredAt: nullable(product.registeredAt), warrantyExpiryDate: nullable(product.warrantyExpiryDate),
      })),
    };
  } catch (error) {
    if (isSonyCustomerNotFound(error)) return { accountStatus: 'not_linked', productState: 'not_applicable', isMock, products: [], placeholder: createSonyAccountPlaceholder() };
    if (isSonyProductsBusinessEmpty(error)) {
      return {
        accountStatus: 'linked',
        productState: 'no_products',
        isMock,
        products: [],
        emptyState: createNoProductState(),
      };
    }
    throw new PortalProductsUnavailableError('Sony products are temporarily unavailable.');
  }
}
