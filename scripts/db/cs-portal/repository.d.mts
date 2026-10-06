import type { Pool, PoolConnection } from 'mysql2/promise';
import type { PortalDataset, DatasetState, DatasetWrite } from '../../../src/lib/cs-portal/types';
export class ConflictError extends Error { status: number }
export function readState(connection: Pool | PoolConnection, lock?: boolean): Promise<DatasetState>;
export function readDataset(connection: Pool | PoolConnection, version: string): Promise<PortalDataset>;
export function importDraft(pool: Pool, input: unknown, revision: string): Promise<DatasetWrite>;
export function mutateDraft(pool: Pool, revision: string, mutate: (dataset: PortalDataset) => PortalDataset): Promise<DatasetWrite>;
export function activateDataset(pool: Pool, version: string, revision: string): Promise<DatasetWrite>;
export function listVersions(pool: Pool): Promise<Array<{version: string; products: number; contents: number}>>;
