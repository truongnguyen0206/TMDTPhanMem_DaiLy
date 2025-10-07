// const { Pool } = require('pg');
// require('dotenv').config();

// // Cấu hình kết nối database
// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'tmdtdaily',
//   password: process.env.DB_PASSWORD || 'password',
//   port: process.env.DB_PORT || 5432,
//   max: 20, // Số kết nối tối đa
//   idleTimeoutMillis: 30000, // Thời gian chờ tối đa
//   connectionTimeoutMillis: 2000, // Thời gian timeout kết nối
// });

// // Test kết nối database
// pool.on('connect', () => {
//   console.log('✅ Kết nối database thành công');
// });

// pool.on('error', (err) => {
//   console.error('❌ Lỗi kết nối database:', err);
// });

// // Hàm query đơn giản
// const query = async (text, params) => {
//   const start = Date.now();
//   try {
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;
//     console.log('Executed query', { text, duration, rows: res.rowCount });
//     return res;
//   } catch (error) {
//     console.error('Query error:', error);
//     throw error;
//   }
// };

// // Hàm transaction
// const getClient = async () => {
//   const client = await pool.connect();
//   const query = client.query;
//   const release = client.release;
  
//   // Monkey patch để log queries
//   client.query = (...args) => {
//     client.lastQuery = args;
//     return query.apply(client, args);
//   };
  
//   client.release = () => {
//     console.log('Releasing client');
//     return release.apply(client);
//   };
  
//   return client;
// };

// module.exports = {
//   query,
//   getClient,
//   pool
// };

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // dùng service key để có quyền admin
);

module.exports = supabase;
