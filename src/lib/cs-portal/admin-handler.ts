import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { DatasetValidationError, validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import { ConflictError } from '../../../scripts/db/cs-portal/repository.mjs';
import { AdminError, contentIdentity, editDataset } from './admin-service';
import type { AdminRepository } from './admin-repository';
import type { PortalContent, PortalDataset } from './types';

const MAX_BODY = 8 * 1024 * 1024;
const hash = (value: string) => createHash('sha256').update(value).digest();
function authorize(request: Request) {
  const token = process.env.CS_PORTAL_ADMIN_TOKEN;
  if (!token?.trim()) throw new AdminError(503, 'ADMIN_NOT_CONFIGURED', 'Admin API is not configured.');
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ') || !timingSafeEqual(hash(header.slice(7)), hash(token))) {
    throw new AdminError(401, 'UNAUTHORIZED', 'A valid admin bearer token is required.');
  }
}
function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new AdminError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) throw new AdminError(413, 'BODY_TOO_LARGE', 'Body exceeds 8 MiB.');
  const reader = request.body?.getReader();
  if (!reader) throw new AdminError(400, 'INVALID_JSON', 'JSON body required.');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY) { await reader.cancel(); throw new AdminError(413, 'BODY_TOO_LARGE', 'Body exceeds 8 MiB.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AdminError(400, 'INVALID_JSON', 'Invalid JSON body.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AdminError(400, 'INVALID_BODY', 'JSON object required.');
  return body;
}
function fields(body: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new AdminError(400, 'INVALID_BODY', 'Unexpected body field.');
}
function revision(body: Record<string, unknown>): string {
  if (typeof body.revision !== 'string' || !/^\d{1,30}$/.test(body.revision)) throw new AdminError(400, 'INVALID_REVISION', 'revision must be a decimal string from GET state.');
  return body.revision;
}
function version(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw new AdminError(400, 'INVALID_VERSION', 'version must be a dataset hash.');
  return value;
}
function pageNumber(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || Number(value) > max) throw new AdminError(400, 'INVALID_QUERY', 'Invalid pagination.');
  return Number(value);
}

export async function handleAdmin(request: Request, path: string[], repository: AdminRepository): Promise<NextResponse> {
  try {
    authorize(request); // Always before body parsing and DB access; LINE cookies are not admin credentials.
    const url = new URL(request.url);
    const method = request.method;
    const route = path.join('/');
    if (route === 'state' && method === 'GET') return response(await repository.state());
    if (route === 'versions' && method === 'GET') return response({ versions: await repository.versions() });
    if (['import/preview', 'import/apply', 'activate', 'rollback'].includes(route)) {
      if (method !== 'POST') throw new AdminError(405, 'METHOD_NOT_ALLOWED', 'Use POST.');
      const body = await readBody(request);
      if (route.startsWith('import/')) {
        fields(body, route === 'import/preview' ? ['dataset'] : ['dataset', 'revision']);
        const checked = validateDataset(body.dataset);
        if (route === 'import/preview') return response({ version: checked.version, products: checked.dataset.products.length, contents: checked.dataset.contents.length });
        return response(await repository.import(checked.dataset, revision(body)), 201);
      }
      fields(body, ['version', 'revision']);
      // Rollback selects an older immutable dataset, with the same validation/CAS as activation.
      return response(await repository.activate(version(body.version), revision(body)));
    }
    const collection = path[0];
    if (collection !== 'products' && collection !== 'contents') throw new AdminError(404, 'NOT_FOUND', 'Endpoint not found.');
    const isItem = collection === 'products' ? path.length === 2 : path.length === 4;
    if (path.length !== 1 && !isItem) throw new AdminError(404, 'NOT_FOUND', 'Endpoint not found.');
    const identity = !isItem ? null : collection === 'products' ? path[1] : JSON.stringify(path.slice(1));
    if (isItem && collection === 'contents' && (!['th','en'].includes(path[1]) || !['cta','article','carousel','page','footer_link'].includes(path[2]))) {
      throw new AdminError(400, 'INVALID_IDENTITY', 'Invalid content locale/type.');
    }
    if (method === 'GET') {
      const state = await repository.state();
      const selected = url.searchParams.get('version');
      const selectedVersion = selected ? version(selected) : state.draft || state.active;
      // Capture the pointer once; all records come from this immutable snapshot.
      const dataset: PortalDataset = selectedVersion ? await repository.dataset(selectedVersion) : { products: [], contents: [] };
      const rows = dataset[collection];
      if (isItem) {
        const item = rows.find(row => collection === 'products' ? 'model_key' in row && row.model_key === identity : contentIdentity(row as PortalContent) === identity);
        if (!item) throw new AdminError(404, 'NOT_FOUND', 'Item not found.');
        return response({ ...state, version: selectedVersion, item });
      }
      const offset = pageNumber(url.searchParams.get('offset'), 0, 1000000);
      const limit = pageNumber(url.searchParams.get('limit'), 100, 500);
      if (!limit) throw new AdminError(400, 'INVALID_QUERY', 'limit must be positive.');
      return response({ ...state, version: selectedVersion, total: rows.length, offset, limit, items: rows.slice(offset, offset + limit) });
    }
    const operation = method === 'POST' && !isItem ? 'create' : method === 'PUT' && isItem ? 'replace' : method === 'DELETE' && isItem ? 'delete' : null;
    if (!operation) throw new AdminError(405, 'METHOD_NOT_ALLOWED', 'Unsupported method for this endpoint.');
    if (url.search) throw new AdminError(400, 'INVALID_QUERY', 'Writes target the current draft; query parameters are not accepted.');
    const body = await readBody(request);
    fields(body, operation === 'delete' ? ['revision'] : ['revision','item']);
    const result = await repository.mutate(revision(body), dataset => editDataset(dataset, collection, operation, identity, body.item));
    return response(result, operation === 'create' ? 201 : 200);
  } catch (error) {
    if (error instanceof AdminError) return response({ code: error.code, message: error.message }, error.status);
    if (error instanceof DatasetValidationError) return response({ code: 'INVALID_DATASET', message: error.message }, 400);
    if (error instanceof ConflictError) return response({ code: 'REVISION_CONFLICT', message: 'Reload state and retry with the current revision.' }, 409);
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) return response({ code: 'NOT_FOUND', message: 'Dataset not found.' }, 404);
    // SQL credentials, query values, and internal failures never enter the response.
    return response({ code: 'INTERNAL_ERROR', message: 'Unable to process the admin request.' }, 500);
  }
}
