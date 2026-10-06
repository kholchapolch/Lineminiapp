import { createHash } from 'node:crypto';

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export class DatasetValidationError extends Error {
  constructor(message) { super(`Invalid dataset: ${message}`); this.status = 400; }
}
function fail(message) { throw new DatasetValidationError(message); }
function text(v, name, max = 10000) {
  if (typeof v !== 'string' || !v.trim() || v.length > max || /<[^>]*>|[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(v)) fail(name);
  return v;
}
function keys(v, allowed) {
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some(k => !allowed.includes(k))) fail('unexpected fields');
}
function order(v) { if (!Number.isInteger(v) || v < 0 || v > 2147483647) fail('sort_order'); }
function httpsUrl(v, hosts) {
  text(v, 'URL', 2048);
  let u; try { u = new URL(v); } catch { fail('URL'); }
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || !u.hostname || (hosts && !hosts.includes(u.hostname))) fail('URL host/protocol');
  return v;
}
export function safeUrl(v) {
  return httpsUrl(v, [
    'www.sony.co.th',
    'web.sony-asia.com',
    'experience.sony-asia.com',
    '8qym66.s.gy',
    'www.playstation.com',
  ]);
}
export function safeImageUrl(v) {
  return httpsUrl(v);
}
function payload(type, p) {
  if (type === 'cta') {
    keys(p, ['label', 'action']); text(p.label, 'CTA label');
    keys(p.action, ['type', 'url', 'route']);
    if (p.action.type === 'articles') {
      keys(p.action, ['type']);
    } else if (p.action.type === 'external') {
      keys(p.action, ['type', 'url']); safeUrl(p.action.url);
    } else if (p.action.type === 'internal') {
      keys(p.action, ['type', 'route']);
      if (!['/my-badges', '/register-product'].includes(p.action.route)) fail('internal CTA route');
    } else fail('CTA action');
  } else if (type === 'page') {
    keys(p, ['title', 'lead', 'blocks']); text(p.title, 'page title'); text(p.lead, 'page lead');
    if (!Array.isArray(p.blocks) || !p.blocks.length) fail('page blocks');
    for (const b of p.blocks) {
      if (!b || typeof b !== 'object') fail('block');
      if (b.type === 'heading' || b.type === 'paragraph') { keys(b, ['type','text']); text(b.text, 'block text'); }
      else if (b.type === 'image') { keys(b, ['type','url','alt']); safeImageUrl(b.url); text(b.alt, 'image alt'); }
      else if (b.type === 'check_list') { keys(b, ['type','items']); if (!Array.isArray(b.items) || !b.items.length) fail('list'); b.items.forEach(t => text(t, 'list item')); }
      else if (b.type === 'link_button') { keys(b, ['type','label','url']); text(b.label, 'button'); safeUrl(b.url); }
      else fail('unknown block');
    }
  } else if (type === 'footer_link') {
    keys(p, ['label','url']); text(p.label, 'footer label'); safeUrl(p.url);
  } else if (type === 'article' || type === 'carousel') {
    keys(p, ['title','description','imageUrl','url']); text(p.title, 'title'); text(p.description, 'description'); safeImageUrl(p.imageUrl); safeUrl(p.url);
  } else fail('unsupported content type in this import stage');
}
export function validatePagePayload(input) {
  payload('page', input);
}

export function validateFooterPayload(input) {
  payload('footer_link', input);
}

export function validateArticlePayload(input) {
  payload('article', input);
}

export function validateCtaPayload(input) {
  payload('cta', input);
}

export function validateCarouselPayload(input) {
  payload('carousel', input);
}

export function validateDataset(input) {
  keys(input, ['products','contents']);
  if (!Array.isArray(input.products) || !Array.isArray(input.contents)) fail('arrays');
  if (input.products.length > 10000 || input.contents.length > 20000) fail('dataset too large');
  const models = new Set(); const categories = new Set(); const contentKeys = new Set();
  for (const p of input.products) {
    keys(p, ['external_key','model_name','model_key','category_code','image_url','sort_order']);
    text(p.model_name, 'model name', 255); text(p.model_key, 'model key', 191);
    if (p.model_key !== p.model_key.trim().toUpperCase() || models.has(p.model_key)) fail('duplicate/noncanonical model key');
    models.add(p.model_key);
    if (p.external_key !== null) text(p.external_key, 'product key',191);
    if (p.category_code !== null) { text(p.category_code, 'category',100); categories.add(p.category_code); }
    // Product images may use any HTTPS host. Link destinations keep the Sony allowlist.
    if (p.image_url !== null) safeImageUrl(p.image_url);
    order(p.sort_order);
  }
  for (const c of input.contents) {
    keys(c, ['external_key','locale','content_type','target_type','target_key','action_key','sort_order','published_at','payload']);
    text(c.external_key, 'content key',191); text(c.target_key, 'target',191);
    if (!['th','en'].includes(c.locale)) fail('locale');
    const k = `${c.locale}:${c.content_type}:${c.external_key}`;
    // MySQL utf8mb4_unicode_ci compares keys case-insensitively; reject case variants here too.
    if (contentKeys.has(k.toLowerCase())) fail('duplicate content key'); contentKeys.add(k.toLowerCase());
    if (c.target_type === 'model') { if (!models.has(c.target_key)) fail('missing model target'); }
    else if (c.target_type === 'category') { if (!categories.has(c.target_key)) fail('missing category target'); }
    else if (c.target_type !== 'global' || c.target_key !== 'global') fail('global target');
    if (['page','footer_link'].includes(c.content_type) && c.target_type !== 'global') fail('global content target');
    if (c.action_key !== null) text(c.action_key, 'action',100);
    if (['article','cta'].includes(c.content_type) && !c.action_key) fail('content action');
    order(c.sort_order);
    if (c.published_at !== null && (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/.test(c.published_at) || Number.isNaN(Date.parse(c.published_at.replace(' ','T')+'Z')))) fail('publish time');
    if (c.published_at !== null && new Date(c.published_at.replace(' ','T')+'Z').toISOString().replace('T',' ').replace('Z','') !== c.published_at) fail('invalid calendar date');
    payload(c.content_type, c.payload);
  }
  const compare = (a,b) => stableJson(a) < stableJson(b) ? -1 : stableJson(a) > stableJson(b) ? 1 : 0;
  const dataset = {products:[...input.products].sort(compare),contents:[...input.contents].sort(compare)};
  return {dataset, version:createHash('sha256').update(stableJson(dataset)).digest('hex')};
}
