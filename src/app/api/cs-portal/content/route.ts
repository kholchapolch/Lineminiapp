import { NextResponse } from 'next/server';
import { loadAppConfig } from '@/lib/app-config';
import { requireLineSession, UnauthorizedError } from '@/lib/auth-session';
import { loadActiveDataset } from '@/lib/cs-portal/content-repository';
import { ContentQueryError, parseContentQuery } from '@/lib/cs-portal/carousel-content';

import { resolvePortalContent } from '@/lib/cs-portal/cta-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    requireLineSession({ config: loadAppConfig(), headers: request.headers });
    const { locale, models } = parseContentQuery(new URL(request.url).searchParams);
    const { dataset } = await loadActiveDataset();
    return json(resolvePortalContent(dataset, locale, models));
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ code: 'UNAUTHORIZED', message: 'LINE session is required.' }, 401);
    if (error instanceof ContentQueryError) return json({ code: 'INVALID_QUERY', message: error.message }, 400);
    return json({ code: 'CONTENT_UNAVAILABLE', message: 'Unable to load Portal content.' }, 500);
  }
}
