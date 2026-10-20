import { NextResponse } from 'next/server';
import { loadAppConfig } from '@/lib/app-config';
import { requireLineSession, UnauthorizedError } from '@/lib/auth-session';
import { loadPortalContentDataset } from '@/lib/cs-portal/content-repository';
import { ContentQueryError } from '@/lib/cs-portal/carousel-content';
import { parseArticlesQuery, resolveArticles } from '@/lib/cs-portal/articles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function GET(request: Request): Promise<NextResponse> {
  try {
    requireLineSession({ config: loadAppConfig(), headers: request.headers });
    const { locale, modelKey, actionKey } = parseArticlesQuery(new URL(request.url).searchParams);
    const dataset = await loadPortalContentDataset([modelKey]);
    return json(resolveArticles(dataset, locale, modelKey, actionKey));
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ code: 'UNAUTHORIZED', message: 'LINE session is required.' }, 401);
    if (error instanceof ContentQueryError) return json({ code: 'INVALID_QUERY', message: error.message }, 400);
    return json({ code: 'ARTICLES_UNAVAILABLE', message: 'Unable to load Portal articles.' }, 500);
  }
}
