import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';
import pg from 'pg';

const { Pool } = pg;

// This will safely run migrations on the database
export async function runMigrations() {
  console.log('Running database migrations...');
  try {
    // Check if tables already exist to avoid errors
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    // If we already have our tables, skip migrations
    if (existingTables.includes('chicken_batches')) {
      console.log('Tables already exist, skipping migrations.');
      await pool.end();
      return;
    }
    
    await pool.end();
    
    // Run migrations since tables don't exist
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}