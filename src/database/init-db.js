/**
 * Database Initialization Script
 * Creates tables if they don't exist
 */

import { pool } from '../lib/database.js';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database schema...');
    
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'src', 'database', 'init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run initialization
initializeDatabase().then(success => {
  console.log('Database ready!');
  process.exit(0);
}).catch(error => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
