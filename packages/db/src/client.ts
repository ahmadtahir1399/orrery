import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getDatabaseConnectionString, usesTransactionPooler } from './utils/connection-string';

// Database connection - DATABASE_URL must be set at runtime
const connectionString = getDatabaseConnectionString();

// Create postgres client. Works with local Postgres and hosted Postgres such
// as Supabase; TLS comes from `?sslmode=require` in DATABASE_URL.
const client = postgres(connectionString, {
  max: Number(process.env.DATABASE_POOL_MAX) || 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: !usesTransactionPooler(connectionString),
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
