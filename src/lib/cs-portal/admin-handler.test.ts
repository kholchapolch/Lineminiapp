import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAdmin } from './admin-handler';
import { editDataset } from './admin-service';
import { ConflictError } from '../../../scripts/db/cs-portal/repository.mjs';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import type { AdminRepository } from './admin-repository';
import type { PortalDataset } from './types';

const token = 'test-only-independent-admin-token';
const sample: PortalDataset = {
  products: [{ external_key: null, model_name: 'ILCE-7M4', model_key: 'ILCE-7M4', category_code: 'DI', image_url: null, sort_order: 0 }],
  contents: [{ external_key: 'firmware', locale: 'th', content_type: 'cta', target_type: 'model', target_key: 'ILCE-7M4', action_key: 'firmware', sort_order: 1, published_at: null, payload: { label: 'Firmware', action: { type: 'articles' } } }],
};
function repository() {
  const version = validateDataset(sample).version;
  const state = { active: version, draft: version, revision: '4' };
  const result = { ...state, products: 1, contents: 1 };
  return {
    state: vi.fn(async () => state), dataset: vi.fn(async () => structuredClone(sample)),
    versions: vi.fn(async () => [{ version, products: 1, contents: 1 }]),
    import: vi.fn(async () => result), activate: vi.fn(async () => result),
    mutate: vi.fn(async (_revision: string, edit: (d: PortalDataset) => PortalDataset) => {
      const checked = validateDataset(edit(structuredClone(sample)));
      return { ...result, draft: checked.version, revision: '5' };
    }),
  } satisfies AdminRepository;
}
function req(path: string, method = 'GET', body?: unknown, authorization: string | null = `Bearer ${token}`) {
  vi.stubEnv('CS_PORTAL_ADMIN_TOKEN', token);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authorization) headers.authorization = authorization;
  return new Request(`https://example.test/api/cs-portal/admin/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function call(path: string, method = 'GET', body?: unknown, repo = repository()) {
  return handleAdmin(req(path, method, body), path.split('?')[0].split('/'), repo);
}
afterEach(() => vi.unstubAllEnvs());

describe('Portal admin authorization and contracts', () => {
  it('rejects no bearer and LINE cookie without any database calls', async () => {
    const repo = repository(); const request = req('state', 'GET', undefined, null);
    request.headers.set('cookie', 'sony_line_session=not-an-admin-token');
    const response = await handleAdmin(request, ['state'], repo);
    expect(response.status).toBe(401); expect(repo.state).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('rejects wrong credentials; missing dedicated secret disables admin', async () => {
    expect((await handleAdmin(req('state', 'GET', undefined, 'Bearer line-or-apim-secret'), ['state'], repository())).status).toBe(401);
    const request = req('state'); vi.stubEnv('CS_PORTAL_ADMIN_TOKEN', '');
    expect((await handleAdmin(request, ['state'], repository())).status).toBe(503);
  });
  it('returns pinned version, revision, pagination and product detail', async () => {
    const repo = repository(); const result = await (await call('products?limit=1', 'GET', undefined, repo)).json();
    expect(result.total).toBe(1); expect(result.revision).toBe('4'); expect(result.items[0].model_key).toBe('ILCE-7M4');
    expect(repo.state).toHaveBeenCalledTimes(1); expect(repo.dataset).toHaveBeenCalledWith(result.version);
    expect((await call('products/UNKNOWN')).status).toBe(404);
    expect((await call('products?limit=0')).status).toBe(400);
    expect((await call('products?version=bad')).status).toBe(400);
    expect((await call('contents/th/cta/firmware')).status).toBe(200);
  });
  it('previews without DB and rejects invalid JSON and oversized input', async () => {
    const repo = repository(); const response = await call('import/preview', 'POST', { dataset: sample }, repo);
    expect(response.status).toBe(200); expect(repo.import).not.toHaveBeenCalled(); expect(repo.state).not.toHaveBeenCalled();
    const bad = req('import/preview', 'POST');
    expect((await handleAdmin(bad, ['import', 'preview'], repo)).status).toBe(400);
    const large = req('import/preview', 'POST', {}); large.headers.set('content-length', String(9 * 1024 * 1024));
    expect((await handleAdmin(large, ['import', 'preview'], repo)).status).toBe(413);
  });
  it('validates import before writing and requires revision', async () => {
    const repo = repository();
    expect((await call('import/apply', 'POST', { dataset: sample }, repo)).status).toBe(400);
    expect((await call('import/apply', 'POST', { dataset: { products: null }, revision: '4' }, repo)).status).toBe(400);
    expect(repo.import).not.toHaveBeenCalled();
    expect((await call('import/apply', 'POST', { dataset: sample, revision: '4' }, repo)).status).toBe(201);
    expect(repo.import).toHaveBeenCalledWith(validateDataset(sample).dataset, '4');
  });
  it('CRUD snapshots leave active untouched and reject dangling model references', async () => {
    const repo = repository();
    const response = await call('products/ILCE-7M4', 'PUT', { revision: '4', item: { ...sample.products[0], model_name: 'Updated' } }, repo);
    const body = await response.json(); expect(response.status).toBe(200); expect(body.active).toBe(validateDataset(sample).version); expect(body.draft).not.toBe(body.active);
    expect((await call('products/ILCE-7M4', 'DELETE', { revision: '4' }, repo)).status).toBe(400);
    expect(repo.activate).not.toHaveBeenCalled();
    expect((await call('contents/th/cta/firmware', 'DELETE', { revision: '4' }, repo)).status).toBe(200);
    expect((await call('products', 'POST', { revision: '4', item: sample.products[0] }, repo)).status).toBe(409);
  });
  it('activation and rollback use explicit version + revision, returning 409 for stale state', async () => {
    const repo = repository(); const version = validateDataset(sample).version;
    for (const endpoint of ['activate', 'rollback']) {
      expect((await call(endpoint, 'POST', { version, revision: '4' }, repo)).status).toBe(200);
      expect(repo.activate).toHaveBeenCalledWith(version, '4');
    }
    repo.activate.mockRejectedValueOnce(new ConflictError());
    expect((await call('activate', 'POST', { version, revision: '3' }, repo)).status).toBe(409);
  });
  it('never exposes SQL errors/secrets', async () => {
    const repo = repository(); repo.state.mockRejectedValue(new Error('mysql://secret-password@private-host'));
    const response = await call('state', 'GET', undefined, repo);
    expect(response.status).toBe(500); expect(await response.text()).not.toContain('secret-password');
  });
});

describe('snapshot edits and validation', () => {
  it('supports create/replace/delete of both collections without changing source', () => {
    let draft = structuredClone(sample);
    draft = editDataset(draft, 'products', 'create', null, { ...sample.products[0], model_key: 'ILCE-9', model_name: 'ILCE-9' });
    draft = editDataset(draft, 'contents', 'create', null, { ...sample.contents[0], locale: 'en' });
    draft = editDataset(draft, 'contents', 'replace', JSON.stringify(['en','cta','firmware']), { ...draft.contents[1], payload: { label: 'Updated', action: { type: 'articles' } } });
    draft = editDataset(draft, 'products', 'delete', 'ILCE-9');
    draft = editDataset(draft, 'contents', 'delete', JSON.stringify(['en','cta','firmware']));
    expect(validateDataset(draft).version).toBe(validateDataset(sample).version);
  });
  it('supports empty snapshots, rejects unsafe CTA and invalid calendar dates', () => {
    expect(validateDataset({ products: [], contents: [] }).version).toHaveLength(64);
    const invalid = structuredClone(sample); invalid.contents[0].payload = { label: 'Click', action: { type: 'external', url: 'javascript:alert(1)' } };
    expect(() => validateDataset(invalid)).toThrow();
    invalid.contents[0].payload = sample.contents[0].payload; invalid.contents[0].published_at = '2026-02-30 00:00:00.000';
    expect(() => validateDataset(invalid)).toThrow();
  });
});
