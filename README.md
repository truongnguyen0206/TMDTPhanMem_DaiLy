<!-- Banner -->
<!-- <p align="center">
  <img src="https://raw.githubusercontent.com/midudev/awesome-readme-templates/main/assets/banner-modern.png" width="100%" />
</p> -->

<h1 align="center">✨ HỆ THỐNG QUẢN LÝ ĐẠI LÝ – CỘNG TÁC VIÊN ✨</h1>

<p align="center">
  <strong>E-Commerce Distributor Management System</strong><br/>
  Xây dựng bởi Node.js – React – Supabase – PostgreSQL  
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?style=for-the-badge">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3DDC84?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Express.js-orange?style=for-the-badge">
</p>

---

<div align="center">

### 👨‍💻 Được phát triển bởi đội ngũ

💠 **Lê Thành Nhân** — *QA Engineer*  
💠 **Phạm Ích Chuyên** — *Backend Developer*  
💠 **Trần Trung Thành** — *Project Manager & Backend Developer*  
💠 **Nguyễn Văn Nhật Trường** — *Frontend Developer*  
💠 **Phạm Đăng An** — *Frontend Developer*  

</div>

---

## 🌟 Giới thiệu

Hệ thống quản lý đa tầng phân phối hỗ trợ đầy đủ quy trình vận hành hệ thống phân phối:

- 👑 **Admin toàn hệ thống**
- 🏭 **Nhà phân phối (NPP)**
- 🧩 **Đại lý**
- 🤝 **Cộng tác viên (CTV)**

Bao phủ toàn bộ nghiệp vụ:  
**đơn hàng – hoa hồng – phân quyền – quản lý mạng lưới – báo cáo – doanh số – liên kết giới thiệu**.

---

## ✨ Tính năng nổi bật

### 👑 Admin
- Quản lý tài khoản & phân quyền (Admin, NPP, Đại lý, CTV).
- Quản lý cấu hình hệ thống, quy tắc hoa hồng, tham số kinh doanh.
- Xem dashboard tổng quan doanh số & hiệu suất từng tầng.
- Xuất báo cáo (Excel/PDF) theo khoảng thời gian & bộ lọc.

### 🏭 Nhà phân phối
- Quản lý danh sách **Đại lý trực thuộc**.
- Theo dõi doanh số & hoa hồng của mạng lưới bên dưới.
- Quản lý sản phẩm được phân phối.

### 🧩 Đại lý
- Quản lý CTV trực thuộc, giám sát hiệu suất từng CTV.
- Quản lý đơn hàng được tạo trong hệ thống.
- Theo dõi hoa hồng và doanh số cá nhân.

### 🤝 CTV
- Lấy link/mã giới thiệu sản phẩm.
- Tạo đơn hàng từ khách được giới thiệu.
- Theo dõi hoa hồng, lịch sử rút tiền, báo cáo cá nhân.

---

# 🖼 Screenshots minh họa UI

<!-- <p align="center">
  <img src="https://raw.githubusercontent.com/midudev/awesome-readme-templates/main/assets/dashboard-placeholder.png" width="80%" />
  <br/>
  <em>Dashboard tổng quan hệ thống</em>
</p> -->

<!-- <p align="center">
  <img src="https://raw.githubusercontent.com/midudev/awesome-readme-templates/main/assets/analytics.png" width="80%" />
  <br/>
  <em>Báo cáo hiệu suất & doanh số</em>
</p> -->

---

# 🧭 Kiến trúc hệ thống

## 🏗 System Architecture Diagram

```mermaid
flowchart TB
    %% =======================
    %% LAYER 1 — CLIENT
    %% =======================
    subgraph CLIENT["🌐 CLIENT LAYER"]
        direction TB
        C1["👑 Admin Portal"]
        C2["🏭 Distributor (NPP) Portal"]
        C3["🧩 Agent / Đại lý Portal"]
        C4["🤝 CTV Portal"]
    end

    %% =======================
    %% LAYER 2 — FRONTEND
    %% =======================
    subgraph FRONTEND["🎨 FRONTEND — React + TailwindCSS"]
        direction TB
        FE1["React SPA"]
        FE2["• React Router<br>• Auth Context<br>• Axios Services<br>• UI Components<br>• Dashboard"]
    end

    %% =======================
    %% LAYER 3 — BACKEND
    %% =======================
    subgraph BACKEND["⚙️ BACKEND — Node.js + Express"]
        direction TB
        RT["📌 Express Routes"]
        MW["🛡 Middleware<br>• JWT Auth<br>• Role Guard<br>• Validation"]
        CT["🧠 Controllers<br>• Orders<br>• Users<br>• Commission<br>• Withdraw"]
        SV["⚙️ Services<br>Business Logic Layer"]
        MDL["📎 Models<br>Supabase Query Layer"]
    end

    %% =======================
    %% LAYER 4 — DATABASE
    %% =======================
    DB[("🛢 Database<br><sub>Supabase / PostgreSQL</sub>")]

    %% CONNECTIONS
    CLIENT --> FRONTEND
    FRONTEND -->|REST API / JSON| RT
    RT --> MW --> CT --> SV --> MDL
    MDL --> DB
