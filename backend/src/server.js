const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/database_config");
const authRoutes = require("./api/routes/auth_route");
const userRoutes = require("./api/routes/user_route");
const orderRouters = require("./api/routes/order_route")
const reportRoutes = require("./api/routes/report_route");
const agentRoutes = require("./api/routes/agent_route");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
  
// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/order", orderRouters)
app.use("/report", reportRoutes);
app.use("/agent", agentRoutes);

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
