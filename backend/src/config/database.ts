import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL Database');
});

db.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});
