const express = require("express");
const cors = require("cors");
const http = require("http");
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
const DistributorRoutes = require("./api/routes/distributor_route");
const medusaBSP = require("../medusa_BSP/medusaBSP_routes/BSP_product_route.js");

const app = express();

// HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Socket.IO realtime
const { initSocket } = require("./realtime/socket");
initSocket(server);

// Middleware
app.use(cors());

// // ======================
// // ⭐ CORS CHO FE DEPLOY
// // ======================
// const allowedOrigins = [
//   "http://localhost:3000/",     // FE local
//   "http://localhost:5001/",     // BE local (test trực tiếp)
//   "https://tmdt-phan-mem-dai-ly.vercel.app/", // <-- thay domain FE vào đây
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.log("❌ CORS blocked:", origin);
//         callback(new Error("Không được phép truy cập bởi CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
  
// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/order", orderRouters);
app.use("/report", reportRoutes);
app.use("/agent", agentRoutes);
app.use("/product", productRoutes);
app.use("/CTV", collaboratorRoute);
app.use("/npp",DistributorRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/commission-rules', commissionRuleRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use("/api/BSP/product", medusaBSP);


// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Kết nối thành công từ backend! 🎉" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server chạy ngon lành 🚀");
});

// app.get("/api/test/products", async (req, res) => {
//   try {
//     const response = await fetch("http://100.65.202.126:9000/store/products", {
//       headers: {
//         // "Authorization": `Bearer ${process.env.MEDUSA_API_KEY}`,
//         "Content-Type": "application/json",
//         "x-publishable-api-key": process.env.MEDUSA_API_KEY
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`Medusa API trả lỗi: ${response.status}`);
//     }

//     const data = await response.json();
//     res.json(data);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });


// Khởi động server 
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n✅ Backend server đang chạy tại http://localhost:${PORT}\n`);
});
