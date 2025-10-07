// backend/src/server.js

// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Để đọc file .env

// Import routes
const authRoutes = require('./api/routes/auth.route.js');
const commissionRoutes = require('./api/routes/commissionRule.route.js');
const commissionRuleRoutes = require('./api/routes/commissionRule.route.js');

// Khởi tạo app express
const app = express();

// Sử dụng middleware
app.use(cors()); // Cho phép frontend truy cập
app.use(express.json()); // Đọc JSON

// Định nghĩa cổng cho server
const PORT = process.env.PORT || 5001;

// === TEST ENDPOINT ===
app.get('/api/test', (req, res) => {
  res.json({ message: 'Kết nối thành công từ backend! 🎉' });
});

// Import Supabase client
const { supabase } = require('./config/supabaseClient');

// === ROUTES ===
// Auth routes
app.use('/api/auth', authRoutes);
// Commission routes (module riêng)
app.use('/api/commissions', commissionRoutes);
// Commission rules routes (quản lý quy tắc hoa hồng)
app.use('/api/commission-rules', commissionRuleRoutes);

// ================== COMMISSION RULES (viết trực tiếp) ==================

// Lấy tất cả commission rules
app.get("/commission_rules", async (req, res) => {
  const { data, error } = await supabase
    .from("commission_rules")
    .select("*, roles(role_name)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Lấy commission rule theo id
app.get("/commission_rules/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("commission_rules")
    .select("*")
    .eq("rule_id", req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Thêm commission rule
app.post("/commission_rules", async (req, res) => {
  const {
    role_id,
    min_sales,
    max_sales,
    commission_rate,
    product_category,
    start_date,
    end_date,
    description,
  } = req.body;

  const { data, error } = await supabase.from("commission_rules").insert([
    {
      role_id,
      min_sales,
      max_sales,
      commission_rate,
      product_category,
      start_date,
      end_date,
      description,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({message: "thêm dữ liệu thành công"});
});

// Cập nhật commission rule
app.put("/commission_rules/:id", async (req, res) => {
  const { id } = req.params;
  const {
    role_id,
    min_sales,
    max_sales,
    commission_rate,
    product_category,
    start_date,
    end_date,
    description,
  } = req.body;

  const { data, error } = await supabase
    .from("commission_rules")
    .update({
      role_id,
      min_sales,
      max_sales,
      commission_rate,
      product_category,
      start_date,
      end_date,
      description,
    })
    .eq("rule_id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Xóa commission rule
app.delete("/commission_rules/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from("commission_rules")
    .delete()
    .eq("rule_id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Commission rule deleted successfully" });
});

// ======================================================================

// Test route
app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("roles").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Roles routes
app.get("/roles", async (req, res) => {
  const { data, error } = await supabase.from("roles").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/roles", async (req, res) => {
  const { role_name, description } = req.body;
  const { data, error } = await supabase
    .from("roles")
    .insert([{ role_name, description }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CTV routes
app.get("/ctv", async (req, res) => {
  const { data, error } = await supabase.from("ctv").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/ctv", async (req, res) => {
  const { user_id, ten_ctv, diachi, ngaythamgia, trangthai } = req.body;
  const { data, error } = await supabase
    .from("ctv")
    .insert([{ user_id, ten_ctv, diachi, ngaythamgia, trangthai }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Users routes (public - for testing)
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/users", async (req, res) => {
  const { username, password, email, phone, role_id, status } = req.body;
  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password, email, phone, role_id, status }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
