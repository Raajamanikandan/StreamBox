import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection, query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('[Migration] Aborting migrations because DB connection failed.');
    return false;
  }

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('[Migration] Applying database schema...');
    await query(schemaSql);
    console.log('[Migration] Database schema applied successfully!');
    return true;
  } catch (error) {
    console.error('[Migration] Failed to apply schema:', error);
    return false;
  }
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations().then(() => pool.end());
}
