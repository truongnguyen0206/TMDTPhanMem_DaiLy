const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Lấy URL và KEY từ biến môi trường (.env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình");
  process.exit(1);
}

// Tạo client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test kết nối Supabase (query siêu nhẹ)
 * Chỉ chạy 1 lần khi server start
 */
(async () => {
    try {
      const { error } = await supabase
        .from("users_view")   // chỉ cần tồn tại
        .select("*", {
          count: "exact",
          head: true,         // 🚫 không trả data
        });
  
      if (error) {
        console.error("❌ Supabase Kết nối thất bại:", error.message);
      } else {
        console.log("✅ Supabase kết nối thành công!");
      }
    } catch (err) {
      console.error("❌ Supabase network error:", err.message);
    }
  })();

module.exports = supabase;
