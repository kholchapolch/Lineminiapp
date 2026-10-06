import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { createLineSessionCookie } from '@/lib/auth-session';
import { loadAppConfig } from '@/lib/app-config';
import { loadActiveDataset } from '@/lib/cs-portal/content-repository';
import { validateDataset } from '../../../../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../../../../scripts/db/cs-portal/fixtures/workbook-uat.json';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/cs-portal/content-repository', () => ({ loadActiveDataset: vi.fn() }));
const snapshot = validateDataset(fixture);

beforeEach(() => {
  vi.stubEnv('APP_ENV', 'local');
  vi.stubEnv('APP_SESSION_SECRET', 'test-only-page-session-secret');
  vi.stubEnv('SONY_PRODUCT_API_MODE', 'mock');
  vi.mocked(loadActiveDataset).mockResolvedValue({ version: snapshot.version, dataset: structuredClone(snapshot.dataset) });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });
function request(query = '?locale=th', session: 'valid' | 'missing' | 'expired' | 'tampered' = 'valid') {
  const headers = new Headers();
  if (session !== 'missing') {
    let cookie = createLineSessionCookie({ config: loadAppConfig(), lineuuid: 'TEST-LINE-USER', ...(session === 'expired' ? { now: 0 } : {}) }).split(';')[0];
    if (session === 'tampered') cookie += 'invalid';
    headers.set('cookie', cookie);
  }
  return new Request(`https://example.test/api/cs-portal/pages/register-product${query}`, { headers });
}

describe('GET Register Product content', () => {
  it('returns workbook TH content as typed blocks with no storage/user data', async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const payload = snapshot.dataset.contents.find(row => row.content_type === 'page')!.payload;
    expect(await response.json()).toEqual({ key: 'register-product', locale: 'th', ...payload });
    expect(loadActiveDataset).toHaveBeenCalledTimes(1);
  });
  it.each(['missing', 'expired', 'tampered'] as const)('rejects %s session before reading DB', async session => {
    const response = await GET(request('?locale=th', session));
    expect(response.status).toBe(401); expect(loadActiveDataset).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('does not trust query UUID or admin bearer as LINE session', async () => {
    const r = request('?locale=th&lineuuid=TEST-LINE-USER', 'missing');
    r.headers.set('authorization', 'Bearer admin-token');
    expect((await GET(r)).status).toBe(401); expect(loadActiveDataset).not.toHaveBeenCalled();
  });
  it.each(['', '?locale=ja', '?locale=TH', '?locale=th&locale=en', '?locale=th&version=draft', '?locale=th&lineuuid=someone'])('rejects invalid query %s', async query => {
    expect((await GET(request(query))).status).toBe(400); expect(loadActiveDataset).not.toHaveBeenCalled();
  });
  it('returns 404 for absent EN without falling back to TH', async () => {
    const response = await GET(request('?locale=en'));
    expect(response.status).toBe(404); expect((await response.json()).code).toBe('PAGE_NOT_FOUND');
  });
  it('supports EN when an actual EN record exists', async () => {
    const dataset = structuredClone(snapshot.dataset);
    const page = dataset.contents.find(c => c.content_type === 'page')!;
    dataset.contents.push({ ...page, locale: 'en', payload: { ...page.payload, title: 'MOCK English page for unit test' } });
    vi.mocked(loadActiveDataset).mockResolvedValue({ version: 'a'.repeat(64), dataset });
    expect((await (await GET(request('?locale=en'))).json()).title).toBe('MOCK English page for unit test');
  });
  it.each(['html', 'unsafe-url', 'duplicate'] as const)('fails safely for invalid stored %s', async kind => {
    const dataset = structuredClone(snapshot.dataset);
    const page = dataset.contents.find(c => c.content_type === 'page')!;
    if (kind === 'duplicate') dataset.contents.push(page);
    else page.payload.blocks = kind === 'html' ? [{ type: 'html', text: '<script>secret</script>' }] : [{ type: 'link_button', label: 'Register', url: 'javascript:alert(1)' }];
    vi.mocked(loadActiveDataset).mockResolvedValue({ version: snapshot.version, dataset });
    const response = await GET(request());
    expect(response.status).toBe(500); expect(await response.text()).not.toContain('secret');
  });
  it('returns safe 500 for missing active version or DB failures', async () => {
    vi.mocked(loadActiveDataset).mockRejectedValue(new Error('mysql://secret-password@private-db'));
    const response = await GET(request());
    expect(response.status).toBe(500); expect(await response.text()).not.toContain('secret-password');
  });
});
