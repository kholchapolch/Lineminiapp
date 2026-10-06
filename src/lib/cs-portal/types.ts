export type PortalProduct = {
  external_key: string | null;
  model_name: string;
  model_key: string;
  category_code: string | null;
  image_url: string | null;
  sort_order: number;
};
export type ContentType = "cta" | "article" | "carousel" | "page" | "footer_link";
export type PortalContent = {
  external_key: string;
  locale: "th" | "en";
  content_type: ContentType;
  target_type: "model" | "category" | "global";
  target_key: string;
  action_key: string | null;
  sort_order: number;
  published_at: string | null;
  payload: Record<string, unknown>;
};
export type PortalDataset = { products: PortalProduct[]; contents: PortalContent[] };
export type DatasetState = { active: string; draft: string; revision: string };
export type DatasetWrite = DatasetState & { products: number; contents: number; previousActive?: string };

export type PageBlock =
  | { type: 'heading' | 'paragraph'; text: string }
  | { type: 'image'; url: string; alt: string }
  | { type: 'check_list'; items: string[] }
  | { type: 'link_button'; label: string; url: string };
export type PagePayload = { title: string; lead: string; blocks: PageBlock[] };
export type RegisterProductPage = PagePayload & { key: 'register-product'; locale: 'th' | 'en' };

export type CarouselPayload = { title: string; description: string; imageUrl: string; url: string };
export type CarouselItem = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  // Source wall-clock value, without inventing a timezone for MySQL DATETIME.
  publishedAt: string | null;
  isMock: boolean;
};
export type ModelCarouselContent = {
  requestedModelKey: string;
  modelKey: string;
  matchedCatalog: boolean;
  categoryCode: string | null;
  fallbackImageUrl: string | null;
  carouselItems: CarouselItem[];
};
export type CarouselContentResponse = { locale: 'th' | 'en'; models: ModelCarouselContent[] };

export type CtaAction =
  | { type: 'articles' }
  | { type: 'external'; url: string }
  | { type: 'internal'; route: '/my-badges' | '/register-product' };
export type CtaPayload = { label: string; action: CtaAction };
export type CtaItem = CtaPayload & {
  key: string;
  actionKey: string;
  source: 'model' | 'category' | 'global';
  isMock: boolean;
};
export type FooterItem = { key: string; label: string; url: string; isMock: boolean };
export type PortalContentResponse = {
  footerItems: FooterItem[];
  locale: 'th' | 'en';
  models: (ModelCarouselContent & { ctaItems: CtaItem[] })[];
};

export type ArticlePayload = { title: string; description: string; imageUrl: string; url: string };
export type ArticleItem = {
  key: string; title: string; summary: string; imageUrl: string; imageAlt: string;
  url: string; publishedAt: string | null; isMock: boolean;
};
export type ArticlesResponse = {
  locale: 'th' | 'en'; modelKey: string; matchedCatalog: boolean; actionKey: string; items: ArticleItem[];
};
