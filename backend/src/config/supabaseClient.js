const { createClient } = require ("@supabase/supabase-js")
require("dotenv").config();

// export const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY
//   );

//   // Nếu bạn muốn dùng service role key (server-side)
// export const supabaseAdmin = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
//   );
  

// Lấy URL và KEY từ biến môi trường (.env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Tạo client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

module.exports = supabase;
