import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

export function getDatabaseConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }

  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.DB_PORT || process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DB || 'tasknebula';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Migrations need a session connection (advisory locks, multi-statement
 * transactions). With a transaction pooler such as Supabase's port 6543, set
 * DATABASE_MIGRATION_URL to the direct or session-pooler connection string.
 */
export function getMigrationConnectionString() {
  return process.env.DATABASE_MIGRATION_URL || getDatabaseConnectionString();
}

/**
 * Transaction-mode poolers (Supabase Supavisor on port 6543, PgBouncer in
 * transaction mode) cannot keep prepared statements between queries. Detect
 * the Supabase pooler port, or honour an explicit DATABASE_PREPARE=false.
 */
export function usesTransactionPooler(connectionString: string) {
  if (process.env.DATABASE_PREPARE === 'false') return true;
  try {
    return new URL(connectionString).port === '6543';
  } catch {
    return false;
  }
}
