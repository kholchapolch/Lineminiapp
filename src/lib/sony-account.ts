/** Shared account-not-found contract for CS Portal and Digital Badge. */
export class SonyCustomerNotFoundError extends Error {
  code = 'CUSTOMER_NOT_FOUND';
  safeMessage = 'Customer profile was not found.';
  constructor() {
    super('Sony customer profile was not found.');
    this.name = 'SonyCustomerNotFoundError';
  }
}

/** HTTP 200 business error that is not customer-not-found (errorCode !== 100). */
export class SonyProductsBusinessEmptyError extends Error {
  code = 'SONY_PRODUCTS_BUSINESS_EMPTY';
  safeMessage = 'No products are available for this account.';
  constructor() {
    super('Sony product API returned a non-100 business error.');
    this.name = 'SonyProductsBusinessEmptyError';
  }
}

export function isSonyCustomerNotFound(error: unknown): error is SonyCustomerNotFoundError {
  return error instanceof SonyCustomerNotFoundError;
}

export function isSonyProductsBusinessEmpty(
  error: unknown,
): error is SonyProductsBusinessEmptyError {
  return error instanceof SonyProductsBusinessEmptyError;
}

export function createSonyAccountPlaceholder() {
  return {
    code: 'LINK_SONY_ACCOUNT' as const,
    showFooter: false as const,
    profileSource: 'liff' as const,
    title: {
      th: 'คุณยังไม่ได้เชื่อมต่อบัญชี\nLINE กับ My Sony Rewards',
      en: 'Your LINE account is not linked\nwith My Sony Rewards yet',
    },
    message: {
      th: 'Your LINE account is not linked with My Sony Rewards yet.',
      en: 'Your LINE account is not linked with My Sony Rewards yet.',
    },
    action: {
      type: 'link_account' as const,
      label: {
        th: 'เชื่อมต่อบัญชี My Sony Rewards',
        en: 'Link My Sony Rewards account',
      },
    },
  };
}
export type SonyAccountPlaceholder = ReturnType<typeof createSonyAccountPlaceholder>;
