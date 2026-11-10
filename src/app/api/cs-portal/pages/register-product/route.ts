import { NextResponse } from 'next/server';
import { loadAppConfig } from '@/lib/app-config';
import { requireLineSession, UnauthorizedError } from '@/lib/auth-session';
import { loadActiveDataset } from '@/lib/cs-portal/content-repository';
import { PageNotFoundError, resolveRegisterProductPage } from '@/lib/cs-portal/register-product-page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    requireLineSession({ config: loadAppConfig(), headers: request.headers });
    const query = new URL(request.url).searchParams;
    const locale = query.get('locale');
    if ((locale !== 'th' && locale !== 'en') || query.getAll('locale').length !== 1 || [...query.keys()].some(key => key !== 'locale')) {
      return json({ code: 'INVALID_QUERY', message: 'Exactly one locale=th|en is required.' }, 400);
    }
    const { dataset } = await loadActiveDataset();
    return json(resolveRegisterProductPage(dataset, locale));
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ code: 'UNAUTHORIZED', message: 'LINE session is required.' }, 401);
    if (error instanceof PageNotFoundError) return json({ code: 'PAGE_NOT_FOUND', message: 'Register Product page is unavailable for this locale.' }, 404);
    return json({ code: 'CONTENT_UNAVAILABLE', message: 'Unable to load Portal content.' }, 500);
  }
}
