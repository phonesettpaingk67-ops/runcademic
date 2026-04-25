/**
 * Database Connection & Query Helper
 * Neon Cloud PostgreSQL with SSL support
 */

import { Pool } from 'pg';

let pool = null;

function initializePool() {
  if (pool) return;

  // Use full DATABASE_URL if available (Neon/cloud), otherwise use individual params
  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'runcademic',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };

  pool = new Pool(connectionConfig);

  console.log('📦 Database config:', {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'runcademic',
    ssl: !!process.env.DATABASE_URL || process.env.DB_SSL === 'true',
    usingConnectionString: !!process.env.DATABASE_URL,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(1);
  });
}

async function query(text, params = []) {
  if (!pool) initializePool();

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) console.warn(`⚠️ Slow query (${duration}ms):`, text);
    return result;
  } catch (error) {
    console.error('❌ PostgreSQL Error:', error.message);
    console.error('   Query:', text);
    console.error('   Params:', params);
    throw error;
  }
}

async function queryOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function queryMany(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  const columns = keys.join(',');
  const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await query(text, values);
  return result.rows[0] || null;
}

async function update(table, data, id, idColumn = 'id') {
  const keys = Object.keys(data);
  const values = [...Object.values(data), id];
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
  const text = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE ${idColumn} = $${keys.length + 1} RETURNING *`;
  return await queryOne(text, values);
}

async function deleteRow(table, id, idColumn = 'id') {
  const result = await query(`DELETE FROM ${table} WHERE ${idColumn} = $1`, [id]);
  return result.rowCount > 0;
}

async function paginate(table, page = 1, limit = 20, orderBy = 'id') {
  const offset = (page - 1) * limit;
  const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
  const total = parseInt(countResult.rows[0].count);
  const rows = await queryMany(`SELECT * FROM ${table} ORDER BY ${orderBy} DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return { rows, total, page, pages: Math.ceil(total / limit), limit };
}

async function testConnection() {
  if (!pool) initializePool();
  try {
    const result = await query('SELECT NOW()');
    console.log('✓ Neon PostgreSQL connected:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function closePool() {
  if (pool) await pool.end();
}

export { query, queryOne, queryMany, insert, update, deleteRow, paginate, testConnection, closePool, pool };
