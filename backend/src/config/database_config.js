const { Pool } = require('pg');
// const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dailyctv',
  password: '123',
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL đã kết nối thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối:", err));

module.exports = pool;



// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY // dùng service key để có quyền admin
// );

// module.exports = supabase;