require("dotenv").config();
const supabase = require("./src/config/supabaseClient");

// import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";
// dotenv.config();

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

(async () => {
  try {
    const { data, error } = await supabase.from("users_view").select("*");


    if (error) throw error;
    console.log("✅ Kết nối thành công:", data);
  } catch (err) {
    console.error("❌ Lỗi khi kết nối Supabase:", err.message);
  }
})();
