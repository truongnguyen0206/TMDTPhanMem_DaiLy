const express = require("express");
const cors = require("cors");
require("dotenv").config();

// const db = require("./config/database_config");
const authRoutes = require("./api/routes/auth_route");
const userRoutes = require("./api/routes/user_route");
const orderRouters = require("./api/routes/order_route")
const reportRoutes = require("./api/routes/report_route");
const agentRoutes = require("./api/routes/agent_route");
const productRoutes = require("./api/routes/product_route");
const collaboratorRoute = require("./api/routes/collaborator_route");
const commissionRoutes = require('./api/routes/commissionRule_route.js');
const commissionRuleRoutes = require('./api/routes/commissionRule_route.js');
const dashboardRoutes = require('./api/routes/dashboard_route.js'); // Thêm route dashboard
const withdrawalRoutes = require('./api/routes/withdrawal_route.js'); // <--- IMPORT MỚI
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
  
// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/order", orderRouters);
app.use("/report", reportRoutes);
app.use("/agent", agentRoutes);
app.use("/product", productRoutes);
app.use("/CTV", collaboratorRoute);





app.use('/api/commissions', commissionRoutes);
app.use('/api/commission-rules', commissionRuleRoutes);
app.use('/api/dashboard', dashboardRoutes);





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
  res.json({message: "cập nhật dữ liệu thành công", data: data[0]});
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


// ...existing code...

// === DASHBOARD ENDPOINTS ===

// 1. Lấy thống kê tổng quan
app.get("/api/dashboard/overview/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;  // Lấy user_id từ route parameter
    const { data, error } = await supabase
      .from("dashboard_overview")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy thống kê theo ngày
app.get("/api/dashboard/daily-stats", async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    let query = supabase
      .from("daily_statistics")
      .select("*")
      .eq("user_id", user_id);

    if (start_date) {
      query = query.gte("stat_date", start_date);
    }
    if (end_date) {
      query = query.lte("stat_date", end_date);
    }

    const { data, error } = await query.order("stat_date", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Lấy thống kê theo tháng
app.get("/api/dashboard/monthly-stats", async (req, res) => {
  try {
    const { user_id, year } = req.query;
    let query = supabase
      .from("monthly_statistics")
      .select("*")
      .eq("user_id", user_id);

    if (year) {
      query = query.eq("EXTRACT(YEAR FROM stat_month)", year);
    }

    const { data, error } = await query.order("stat_month", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Lấy top sản phẩm
app.get("/api/dashboard/top-products", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { data, error } = await supabase
      .from("top_products")
      .select("*")
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Lấy thống kê hoa hồng
app.get("/api/dashboard/commission-stats", async (req, res) => {
  try {
    const { user_id, year, month } = req.query;
    let query = supabase
      .from("hoahong")
      .select(`
        hoahong_id,
        user_id,
        thang,
        nam,
        doanhso,
        tile,
        tienhoahong
      `)
      .eq("user_id", user_id);

    if (year) query = query.eq("nam", year);
    if (month) query = query.eq("thang", month);

    const { data, error } = await query.order("nam", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Lấy số dư khả dụng
app.get("/api/dashboard/balance", async (req, res) => {
  try {
    const { user_id } = req.query;
    const { data, error } = await supabase
      .from("user_balance")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Cập nhật cấu hình dashboard
app.post("/api/dashboard/settings", async (req, res) => {
  try {
    const { user_id, display_widgets, widget_positions } = req.body;
    const { data, error } = await supabase
      .from("dashboard_settings")
      .upsert([
        {
          user_id,
          display_widgets,
          widget_positions,
          last_updated: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Lấy cấu hình dashboard
app.get("/api/dashboard/settings", async (req, res) => {
  try {
    const { user_id } = req.query;
    const { data, error } = await supabase
      .from("dashboard_settings")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === END DASHBOARD ENDPOINTS ===


// ... (code middleware)

// === ROUTES ===
// Withdrawal routes (thêm dòng này)
app.use('/api/withdrawals', withdrawalRoutes); // <--- KÍCH HOẠT ROUTE MỚI


// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Kết nối thành công từ backend! 🎉" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server chạy ngon lành 🚀");
});

// Khởi động server 
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
