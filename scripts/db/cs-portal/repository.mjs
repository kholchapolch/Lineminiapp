import { validateDataset } from './dataset.mjs';

const pointerKeys = ['cs_portal_active_dataset_version', 'cs_portal_draft_dataset_version', 'cs_portal_revision'];
const manifestPrefix = 'cs_portal_dataset:';

export class ConflictError extends Error {
  constructor() { super('Dataset revision changed (409)'); this.status = 409; }
}

export async function readState(connection, lock = false) {
  const [rows] = await connection.query(
    `SELECT \`key\`, \`value\` FROM app_config WHERE \`key\` IN (?, ?, ?) ORDER BY \`key\`${lock ? ' FOR UPDATE' : ''}`,
    pointerKeys,
  );
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]));
  if (values[pointerKeys[0]] === undefined || values[pointerKeys[1]] === undefined) throw new Error('Run Portal migration first');
  return { active: values[pointerKeys[0]], draft: values[pointerKeys[1]], revision: values[pointerKeys[2]] ?? '0' };
}

export async function readDataset(connection, version) {
  if (!/^[a-f0-9]{64}$/.test(version)) throw new Error('Invalid version');
  const [products] = await connection.query('SELECT external_key,model_name,model_key,category_code,image_url,sort_order FROM cs_portal_products WHERE dataset_version=?', [version]);
  const [contents] = await connection.query('SELECT external_key,locale,content_type,target_type,target_key,action_key,sort_order,published_at,payload FROM cs_portal_contents WHERE dataset_version=?', [version]);
  if (!products.length && !contents.length) {
    const [manifest] = await connection.query('SELECT `value` FROM app_config WHERE `key`=?', [manifestPrefix + version]);
    if (!manifest.length) {
      const error = new Error('Dataset not found'); error.status = 404; throw error;
    }
  }
  for (const row of contents) {
    if (typeof row.payload === 'string') row.payload = JSON.parse(row.payload);
    if (row.published_at !== null) row.published_at = row.published_at.includes('.') ? row.published_at.padEnd(23, '0') : row.published_at + '.000';
  }
  let checked;
  try { checked = validateDataset({ products, contents }); }
  catch { throw new Error('Stored dataset is invalid'); }
  if (checked.version !== version) throw new Error('Stored dataset hash mismatch');
  return checked.dataset;
}

async function transaction(pool, expectedRevision, operation) {
  if (!/^\d+$/.test(expectedRevision)) throw new Error('Expected revision required');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Existing pointers serialize even the first creation of the revision row.
    const state = await readState(connection, true);
    if (state.revision !== expectedRevision) throw new ConflictError();
    const result = await operation(connection, state);
    const revision = String(BigInt(state.revision) + 1n);
    await connection.query("INSERT INTO app_config (`key`,`value`) VALUES ('cs_portal_revision',?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)", [revision]);
    await connection.commit();
    return { ...result, revision };
  } catch (error) {
    await connection.rollback(); throw error;
  } finally { connection.release(); }
}

async function saveDraft(connection, input, state) {
  const { dataset, version } = validateDataset(input);
  const [existing] = await connection.query('SELECT (SELECT COUNT(*) FROM cs_portal_products WHERE dataset_version=?) + (SELECT COUNT(*) FROM cs_portal_contents WHERE dataset_version=?) AS n', [version, version]);
  if (existing[0].n) {
    await readDataset(connection, version);
  } else {
    for (const product of dataset.products) {
      await connection.query('INSERT INTO cs_portal_products (dataset_version,external_key,model_name,model_key,category_code,image_url,sort_order) VALUES (?,?,?,?,?,?,?)', [version, product.external_key, product.model_name, product.model_key, product.category_code, product.image_url, product.sort_order]);
    }
    for (const row of dataset.contents) {
      await connection.query('INSERT INTO cs_portal_contents (dataset_version,external_key,locale,content_type,target_type,target_key,action_key,sort_order,published_at,payload) VALUES (?,?,?,?,?,?,?,?,?,?)', [version, row.external_key, row.locale, row.content_type, row.target_type, row.target_key, row.action_key, row.sort_order, row.published_at, JSON.stringify(row.payload)]);
    }
  }
  // Records an empty snapshot too; old non-empty datasets do not require backfill.
  await connection.query('INSERT IGNORE INTO app_config (`key`,`value`) VALUES (?,?)', [manifestPrefix + version, JSON.stringify({ products: dataset.products.length, contents: dataset.contents.length })]);
  await readDataset(connection, version);
  await connection.query("UPDATE app_config SET `value`=? WHERE `key`='cs_portal_draft_dataset_version'", [version]);
  return { active: state.active, draft: version, products: dataset.products.length, contents: dataset.contents.length };
}

export async function importDraft(pool, input, expectedRevision) {
  const { dataset } = validateDataset(input);
  return transaction(pool, expectedRevision, (connection, state) => saveDraft(connection, dataset, state));
}

export async function mutateDraft(pool, expectedRevision, mutate) {
  return transaction(pool, expectedRevision, async (connection, state) => {
    const version = state.draft || state.active;
    const dataset = version ? await readDataset(connection, version) : { products: [], contents: [] };
    return saveDraft(connection, mutate(dataset), state);
  });
}

export async function activateDataset(pool, version, expectedRevision) {
  return transaction(pool, expectedRevision, async (connection, state) => {
    const data = await readDataset(connection, version);
    await connection.query("UPDATE app_config SET `value`=? WHERE `key`='cs_portal_active_dataset_version'", [version]);
    return { previousActive: state.active, active: version, draft: state.draft, products: data.products.length, contents: data.contents.length };
  });
}

export async function listVersions(pool) {
  const [rows] = await pool.query(`
    SELECT versions.version,
      (SELECT COUNT(*) FROM cs_portal_products p WHERE p.dataset_version=versions.version) products,
      (SELECT COUNT(*) FROM cs_portal_contents c WHERE c.dataset_version=versions.version) contents
    FROM (
      SELECT dataset_version AS version FROM cs_portal_products
      UNION SELECT dataset_version FROM cs_portal_contents
      UNION SELECT SUBSTRING(\`key\`, ?) FROM app_config WHERE LEFT(\`key\`, ?)=?
    ) versions ORDER BY versions.version`, [manifestPrefix.length + 1, manifestPrefix.length, manifestPrefix]);
  return rows;
}
