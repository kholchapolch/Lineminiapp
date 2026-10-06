import type { PortalDataset, PagePayload, CarouselPayload, CtaPayload, ArticlePayload } from '../../../src/lib/cs-portal/types';
export class DatasetValidationError extends Error { status: number }
export function stableJson(value: unknown): string;
export function safeUrl(value: unknown): string;
export function safeImageUrl(value: unknown): string;
export function validateDataset(input: unknown): {dataset: PortalDataset; version: string};
export function validatePagePayload(input: unknown): asserts input is PagePayload;
export function validateCarouselPayload(input: unknown): asserts input is CarouselPayload;

export function validateCtaPayload(input: unknown): asserts input is CtaPayload;

export function validateArticlePayload(input: unknown): asserts input is ArticlePayload;

export function validateFooterPayload(input: unknown): asserts input is { label: string; url: string };
