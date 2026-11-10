// UAT-only mock. This text is embedded in the image so it cannot look like a real product photo.
export const MOCK_PRODUCT_IMAGE_URL = 'https://placehold.co/600x600/F1F5F9/475569/png?text=MOCK%5CnPRODUCT+IMAGE%5CnPLACEHOLDER';

export function withProductPlaceholders(dataset) {
  return {
    products: dataset.products.map(product => ({
      ...product,
      image_url: product.image_url ?? MOCK_PRODUCT_IMAGE_URL,
    })),
    contents: dataset.contents,
  };
}
