import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support both DATABASE_URL and separate credentials
const isCloudOrProduction = process.env.NODE_ENV === 'production' || 
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'));

const isSslDisabled = process.env.PGSSL === 'false' || 
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=disable'));

const sslConfig = isSslDisabled ? false : { rejectUnauthorized: false };

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudOrProduction && !isSslDisabled ? sslConfig : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'streambox',
      ssl: isCloudOrProduction && !isSslDisabled ? sslConfig : false,
    };

export const pool = new Pool(poolConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time, current_database() AS database_name;');
    client.release();
    console.log(`[Database] Connected successfully to "${result.rows[0].database_name}" at ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    return false;
  }
};

export const query = (text, params) => pool.query(text, params);
