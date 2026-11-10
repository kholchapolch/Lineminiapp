import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadActiveDataset, loadActiveProductCatalog, loadPortalContentDataset } from './content-repository';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../scripts/db/cs-portal/fixtures/workbook-uat.json';
const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/db', () => ({ getPool: () => ({ query }) }));
afterEach(() => query.mockReset());

describe('active content snapshot', () => {
  it('captures active once and reads both tables with that version, never draft', async () => {
    const checked = validateDataset(fixture);
    query.mockResolvedValueOnce([[{ key: 'cs_portal_active_dataset_version', value: checked.version }, { key: 'cs_portal_draft_dataset_version', value: 'b'.repeat(64) }]])
      .mockResolvedValueOnce([structuredClone(checked.dataset.products)])
      .mockResolvedValueOnce([structuredClone(checked.dataset.contents)]);
    expect(await loadActiveDataset()).toEqual({ version: checked.version, dataset: checked.dataset });
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[1][1]).toEqual([checked.version]);
    expect(query.mock.calls[2][1]).toEqual([checked.version]);
  });
  it('does not fall back to draft when active is absent', async () => {
    query.mockResolvedValueOnce([[{ key: 'cs_portal_active_dataset_version', value: '' }, { key: 'cs_portal_draft_dataset_version', value: 'b'.repeat(64) }]]);
    await expect(loadActiveDataset()).rejects.toThrow('unavailable'); expect(query).toHaveBeenCalledTimes(1);
  });
  it('reads only the product catalog for the active version', async () => {
    const version = 'c'.repeat(64);
    query.mockResolvedValueOnce([[{ key: 'cs_portal_active_dataset_version', value: version }, { key: 'cs_portal_draft_dataset_version', value: 'b'.repeat(64) }]])
      .mockResolvedValueOnce([[{ external_key: null, model_name: 'Lens', model_key: 'SEL70200GM2', category_code: 'DI', image_url: 'https://sony.scene7.com/image', sort_order: 2 }]]);
    await expect(loadActiveProductCatalog()).resolves.toEqual([
      { external_key: null, model_name: 'Lens', model_key: 'SEL70200GM2', category_code: 'DI', image_url: 'https://sony.scene7.com/image', sort_order: 2 },
    ]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(String(query.mock.calls[1][0])).toContain('cs_portal_products');
    expect(String(query.mock.calls[1][0])).not.toContain('cs_portal_contents');
    expect(query.mock.calls[1][1]).toEqual([version]);
  });
  it('loads only CTA and article rows for requested model targets', async () => {
    const version = 'd'.repeat(64);
    query.mockResolvedValueOnce([[{ key: 'cs_portal_active_dataset_version', value: version }, { key: 'cs_portal_draft_dataset_version', value: 'b'.repeat(64) }]])
      .mockResolvedValueOnce([[{ external_key: null, model_name: 'FX2', model_key: 'ILME-FX2', category_code: 'DI', image_url: null, sort_order: 0 }]])
      .mockResolvedValueOnce([[{
        external_key: 'article-1', locale: 'th', content_type: 'article', target_type: 'model', target_key: 'ILME-FX2',
        action_key: 'user-manual', sort_order: 1, published_at: '2026-01-01 00:00:00',
        payload: JSON.stringify({ title: 'Guide', description: 'Desc', imageUrl: 'https://www.sony.co.th/a.png', url: 'https://www.sony.co.th/a' }),
      }]]);
    const dataset = await loadPortalContentDataset(['ILME-FX2']);
    expect(dataset.products).toHaveLength(1);
    expect(dataset.contents).toEqual([expect.objectContaining({ external_key: 'article-1', action_key: 'user-manual', published_at: '2026-01-01 00:00:00.000' })]);
    expect(String(query.mock.calls[2][0])).toContain("content_type IN ('cta', 'article', 'carousel')");
    expect(query.mock.calls[2][1]).toEqual([version, 'ILME-FX2', 'DI']);
  });
  it('rejects a dangling active pointer even when there are no page rows', async () => {
    query.mockResolvedValueOnce([[{ key: 'cs_portal_active_dataset_version', value: 'a'.repeat(64) }, { key: 'cs_portal_draft_dataset_version', value: '' }]])
      .mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    await expect(loadActiveDataset()).rejects.toThrow('Dataset not found');
  });
});
