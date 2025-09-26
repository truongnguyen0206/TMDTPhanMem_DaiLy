const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const authRoutes = require("./api/routes/auth.route");
const userRoutes = require("./api/routes/user.route");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);


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
