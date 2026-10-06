import fs from 'node:fs';
import {validateDataset} from './dataset.mjs';
import {withProductPlaceholders, MOCK_PRODUCT_IMAGE_URL} from './product-placeholder.mjs';

const [source, output] = process.argv.slice(2);
if (!source || !output || source === output) throw new Error('Provide distinct source and output JSON paths.');
const original = validateDataset(JSON.parse(fs.readFileSync(source, 'utf8')));
const prepared = validateDataset(withProductPlaceholders(original.dataset));
// Exclusive creation prevents accidentally replacing a reviewed dataset file.
fs.writeFileSync(output, JSON.stringify(prepared.dataset, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({
  sourceVersion: original.version,
  version: prepared.version,
  mockProductImages: prepared.dataset.products.filter(p => p.image_url === MOCK_PRODUCT_IMAGE_URL).length,
  mockImageUrl: MOCK_PRODUCT_IMAGE_URL,
}, null, 2));
