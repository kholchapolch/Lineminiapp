import 'server-only';
import { getPool } from '@/lib/db';
import { activateDataset, importDraft, listVersions, mutateDraft, readDataset, readState } from '../../../scripts/db/cs-portal/repository.mjs';
import type { PortalDataset } from './types';

export const adminRepository = {
  state: () => readState(getPool()),
  dataset: (version: string) => readDataset(getPool(), version),
  versions: () => listVersions(getPool()),
  import: (dataset: PortalDataset, revision: string) => importDraft(getPool(), dataset, revision),
  mutate: (revision: string, edit: (dataset: PortalDataset) => PortalDataset) => mutateDraft(getPool(), revision, edit),
  activate: (version: string, revision: string) => activateDataset(getPool(), version, revision),
};
export type AdminRepository = typeof adminRepository;
