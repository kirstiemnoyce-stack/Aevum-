const { Pool } = require('pg');
require('dotenv').config();
const { initializeTables } = require('./initTables');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'aevum'
});

let initPromise = null;

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
  if (!initPromise) {
    initPromise = initializeTables(pool).catch((err) => {
      console.error('❌ Error creating tables:', err);
      process.exit(1);
    });
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

module.exports = pool;
