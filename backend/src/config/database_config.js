const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dailyctv',
  password: '123456',
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL đã kết nối thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối:", err));

module.exports = pool;
