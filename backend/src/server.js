// File: server.js (Phiên bản đã tái cấu trúc)

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Các file route
const authRoutes = require("./api/routes/auth_route");
const userRoutes = require("./api/routes/user_route");
const orderRouters = require("./api/routes/order_route");
const reportRoutes = require("./api/routes/report_route");
const agentRoutes = require("./api/routes/agent_route");
const productRoutes = require("./api/routes/product_route");
const collaboratorRoute = require("./api/routes/collaborator_route");
const commissionRuleRoutes = require('./api/routes/commissionRule_route.js'); // Sửa lại đường dẫn
const dashboardRoutes = require('./api/routes/dashboard_route.js');
const withdrawalRoutes = require('./api/routes/withdrawal_route.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
  
// Routes - Tổng đài viên bắt đầu làm việc
// Gợi ý: Chuẩn hóa tất cả các route với tiền tố /api cho nhất quán
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRouters);       // Đổi /order -> /api/orders
app.use("/api/reports", reportRoutes);     // Đổi /report -> /api/reports
app.use("/api/agents", agentRoutes);       // Đổi /agent -> /api/agents
app.use("/api/products", productRoutes);   // Đổi /product -> /api/products
app.use("/api/collaborators", collaboratorRoute); // Đổi /CTV -> /api/collaborators
app.use('/api/commission-rules', commissionRuleRoutes); // Route mới đã refactor
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

// XÓA TẤT CẢ CÁC ĐOẠN app.get, app.post... của commission_rules, roles, ctv... ở đây.
// Chúng đã được chuyển về nhà mới.

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