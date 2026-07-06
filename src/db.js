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

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
  initializeTables(pool).catch((err) => {
    console.error('❌ Error creating tables:', err);
  });
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

module.exports = pool;
