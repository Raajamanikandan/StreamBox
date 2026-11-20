import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Helper to determine initial SSL configuration
const shouldEnableSsl = () => {
  if (process.env.PGSSL === 'false') return false;
  if (process.env.PGSSL === 'true') return { rejectUnauthorized: false };

  const connStr = process.env.DATABASE_URL || '';
  if (connStr.includes('sslmode=disable') || connStr.includes('selfmade.ninja')) {
    return false;
  }
  if (connStr.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }

  const host = process.env.PGHOST || '';
  if (host.includes('selfmade.ninja') || host.includes('localhost') || host.includes('127.0.0.1')) {
    return false;
  }

  // Neon, Supabase, Render, AWS RDS typically use SSL
  return process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
};

const getPoolConfig = (useSsl = shouldEnableSsl()) => {
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL;
    if (!useSsl && url.includes('sslmode=require')) {
      url = url.replace('sslmode=require', 'sslmode=disable');
    }
    return {
      connectionString: url,
      ssl: useSsl,
    };
  }
  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'streambox',
    ssl: useSsl,
  };
};

export let pool = new Pool(getPoolConfig());

// Test database connection with auto-fallback if SSL is unsupported
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time, current_database() AS database_name;');
    client.release();
    console.log(`[Database] Connected successfully to "${result.rows[0].database_name}" at ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    // If the server rejected SSL, automatically fallback to non-SSL
    if (error.message && error.message.includes('does not support SSL')) {
      console.log('[Database] Server does not support SSL. Retrying without SSL...');
      try {
        await pool.end();
        pool = new Pool(getPoolConfig(false));
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() AS current_time, current_database() AS database_name;');
        client.release();
        console.log(`[Database] Connected successfully (non-SSL) to "${result.rows[0].database_name}" at ${result.rows[0].current_time}`);
        return true;
      } catch (retryError) {
        console.error('[Database] Connection failed without SSL:', retryError.message);
        return false;
      }
    }
    console.error('[Database] Connection failed:', error.message);
    return false;
  }
};

export const query = (text, params) => pool.query(text, params);
