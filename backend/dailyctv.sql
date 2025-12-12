ALTER USER postgres WITH PASSWORD '123456';

-- Tạo schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS member;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS statistic;
CREATE SCHEMA IF NOT EXISTS display;

-- ================
-- AUTH SCHEMA
-- ================
CREATE TABLE IF NOT EXISTS auth.roles (
    role_id SERIAL PRIMARY KEY,	
    role_name VARCHAR(50) UNIQUE NOT NULL, -- Admin, NhanVien, DaiLy, CTV,...
    description VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS auth.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role_id INT NOT NULL REFERENCES auth.roles(role_id),

    -- Thay đổi phần trạng thái
    status VARCHAR(50) DEFAULT 'Đang chờ cấp tài khoản' 
        CHECK (status IN ('Đang hoạt động', 'Đang chờ cấp tài khoản', 'Ngừng hoạt động')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================
-- MEMBER SCHEMA
-- ================
CREATE TABLE IF NOT EXISTS member.agent (
    agent_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL 
        REFERENCES auth.users(user_id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    agent_code VARCHAR(10) UNIQUE,
    agent_name VARCHAR(100) NOT NULL,
    diachi VARCHAR(100),
    masothue VARCHAR(20),
    phone VARCHAR(15),
    ngaythamgia DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS member.ctv (
    ctv_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
	ctv_code VARCHAR(10) UNIQUE,
    ctv_name VARCHAR(100) NOT NULL,
    diachi VARCHAR(100),
	phone VARCHAR(15),
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    agent_id INT REFERENCES member.agent(agent_id) -- gán CTV thuộc agent
);

CREATE TABLE IF NOT EXISTS member.nhaphanphoi (
    npp_id SERIAL PRIMARY KEY,
	npp_code VARCHAR(10) UNIQUE,
    npp_name VARCHAR(100) NOT NULL,
    diachi VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS member.customer (
    customer_id SERIAL PRIMARY KEY,
	customer_code VARCHAR(10) UNIQUE,
    customer_name VARCHAR(200) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    diachi VARCHAR(100),
    ngaythamgia DATE DEFAULT CURRENT_DATE
);

-- ================
-- TRANSACTIONS SCHEMA
-- ================
CREATE TABLE IF NOT EXISTS transactions.hoahong (
    hoahong_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    thang INT,
    nam INT,
    doanhso NUMERIC(15,2) DEFAULT 0,
    tile NUMERIC(5,2) DEFAULT 0,
    tienhoahong NUMERIC(15,2) GENERATED ALWAYS AS (doanhso * tile / 100) STORED
);

CREATE TABLE transactions.commission_rules (
    rule_id SERIAL PRIMARY KEY,
    role_id INT REFERENCES auth.roles(role_id) ON DELETE CASCADE, -- áp dụng cho vai trò nào
    min_sales NUMERIC(15,2) DEFAULT 0,   -- doanh số tối thiểu để áp dụng rule
    max_sales NUMERIC(15,2),             -- doanh số tối đa (NULL = không giới hạn)
    commission_rate NUMERIC(5,2) NOT NULL, -- % hoa hồng
    product_category VARCHAR(100),       -- optional: áp dụng cho nhóm sản phẩm nào
    start_date DATE DEFAULT CURRENT_DATE, -- ngày bắt đầu hiệu lực
    end_date DATE,                        -- ngày kết thúc hiệu lực (NULL = vô thời hạn)
    description TEXT
);

-- =====================================================================
-- Bổ sung Cột cho Bảng COMMISSION_RULES
-- =====================================================================

ALTER TABLE transactions.commission_rules
    -- 1. scope_type (Phạm vi áp dụng: PRODUCT, CATEGORY, GLOBAL)
    ADD COLUMN IF NOT EXISTS scope_type VARCHAR(20) NOT NULL DEFAULT 'CATEGORY'
        CHECK (scope_type IN ('PRODUCT', 'CATEGORY', 'GLOBAL')),

    -- 2. max_commission_cap (Hoa hồng tối đa cho quy tắc này - Quy tắc B1 nâng cao)
    -- Giúp kiểm soát không cho phép thiết lập vượt quá mức trần cục bộ
    ADD COLUMN IF NOT EXISTS max_commission_cap NUMERIC(5,2), 

    -- 3. status (Trạng thái quy tắc: Active, Inactive, Draft)
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive', 'Draft')),

    -- 4. created_by (Người tạo/chỉnh sửa)
    ADD COLUMN IF NOT EXISTS created_by INT REFERENCES web_auth.users(user_id) 
        -- ON DELETE SET NULL nếu muốn giữ lại lịch sử quy tắc khi Admin bị xóa.

        -- =====================================================================
-- BƯỚC 1: DỌN DẸP (Xóa View và các ràng buộc cũ gây lỗi)
-- =====================================================================
DROP VIEW IF EXISTS public.commissionrule;

-- Xóa các constraint cũ nếu có để tránh xung đột
ALTER TABLE transactions.commission_rules DROP CONSTRAINT IF EXISTS chk_max_commission_cap;
ALTER TABLE transactions.commission_rules DROP CONSTRAINT IF EXISTS chk_commission_rate_range;
ALTER TABLE transactions.commission_rules DROP CONSTRAINT IF EXISTS commission_rules_created_by_fkey;
ALTER TABLE transactions.commission_rules DROP CONSTRAINT IF EXISTS commission_rules_scope_type_check;
ALTER TABLE transactions.commission_rules DROP CONSTRAINT IF EXISTS commission_rules_status_check;

-- =====================================================================
-- BƯỚC 2: SỬA CỘT created_by (FIX LỖI AUTH USER ID)
-- =====================================================================
-- Xóa cột cũ (đang là INT bị sai)
ALTER TABLE transactions.commission_rules DROP COLUMN IF EXISTS created_by;

-- Tạo lại cột mới là UUID (để khớp với auth.users.id của Supabase)
ALTER TABLE transactions.commission_rules ADD COLUMN created_by UUID;

-- Tạo khóa ngoại trỏ vào auth.users(id)
ALTER TABLE transactions.commission_rules 
    ADD CONSTRAINT commission_rules_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================================================================
-- BƯỚC 3: NỚI RỘNG CỘT SỐ (FIX LỖI TRÀN SỐ - OVERFLOW)
-- =====================================================================
-- Ép kiểu các cột tiền tệ lên kích thước lớn (20 số, 2 số lẻ)
ALTER TABLE transactions.commission_rules 
    ALTER COLUMN min_sales TYPE NUMERIC(20, 2),
    ALTER COLUMN max_sales TYPE NUMERIC(20, 2),
    ALTER COLUMN max_commission_cap TYPE NUMERIC(20, 2),
    ALTER COLUMN commission_rate TYPE NUMERIC(10, 2);

-- =====================================================================
-- BƯỚC 4: BỔ SUNG CÁC CỘT CÒN THIẾU & RÀNG BUỘC
-- =====================================================================
-- Cột scope_type
ALTER TABLE transactions.commission_rules 
    ADD COLUMN IF NOT EXISTS scope_type VARCHAR(20) NOT NULL DEFAULT 'CATEGORY';

ALTER TABLE transactions.commission_rules 
    ADD CONSTRAINT commission_rules_scope_type_check 
    CHECK (scope_type IN ('PRODUCT', 'CATEGORY', 'GLOBAL'));

-- Cột status
ALTER TABLE transactions.commission_rules 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active';

ALTER TABLE transactions.commission_rules 
    ADD CONSTRAINT commission_rules_status_check 
    CHECK (status IN ('Active', 'Inactive', 'Draft'));

-- Ràng buộc logic tiền tệ
-- 1. Mức trần tối đa 10 triệu (như bạn yêu cầu)
ALTER TABLE transactions.commission_rules 
    ADD CONSTRAINT chk_max_commission_cap 
    CHECK (max_commission_cap <= 10000000); 

-- 2. Tỷ lệ % từ 0 đến 100
ALTER TABLE transactions.commission_rules 
    ADD CONSTRAINT chk_commission_rate_range 
    CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- =====================================================================
-- BƯỚC 5: HOÀN TẤT (Tạo lại View & Comment)
-- =====================================================================
COMMENT ON COLUMN transactions.commission_rules.scope_type IS 'Phạm vi: PRODUCT, CATEGORY, GLOBAL';
COMMENT ON COLUMN transactions.commission_rules.max_commission_cap IS 'Mức trần hoa hồng (VNĐ) - Tối đa 10 triệu';
COMMENT ON COLUMN transactions.commission_rules.created_by IS 'Người tạo (UUID - Link tới auth.users)';

-- Tạo lại View để API Backend sử dụng được cột mới
CREATE OR REPLACE VIEW public.commissionrule AS
SELECT * FROM transactions.commission_rules;

-- Cấp quyền truy cập
GRANT ALL ON public.commissionrule TO postgres, anon, authenticated, service_role;
;

-- Cập nhật COMMENT để làm rõ hơn
COMMENT ON COLUMN transactions.commission_rules.scope_type 
    IS 'Phạm vi: PRODUCT (sản phẩm cụ thể), CATEGORY (nhóm sản phẩm), GLOBAL (tất cả).';

COMMENT ON COLUMN transactions.commission_rules.max_commission_cap 
    IS 'Giới hạn tối đa cho tỷ lệ hoa hồng này (Business Rule B1).';
    
COMMENT ON COLUMN transactions.commission_rules.status 
    IS 'Trạng thái hoạt động của quy tắc.';
    
COMMENT ON COLUMN transactions.commission_rules.created_by 
    IS 'ID Admin/User đã thiết lập quy tắc này.';

    -- Cấp quyền sử dụng Sequence cho các role của Supabase
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA transactions TO postgres, anon, authenticated, service_role;

-- Đảm bảo quyền ghi vào bảng cũng được cấp đầy đủ (đề phòng)
GRANT ALL ON TABLE transactions.commission_rules TO postgres, anon, authenticated, service_role;

CREATE TABLE transactions.withdraw_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 1000000), -- tối thiểu 1 triệu
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' -- Pending / Approved / Rejected / Paid
);

    -- Thêm cột created_by vào bảng commission_rules
ALTER TABLE transactions.commission_rules
    ADD COLUMN IF NOT EXISTS created_by INT REFERENCES auth.users(user_id);
    
-- Cập nhật COMMENT
COMMENT ON COLUMN transactions.commission_rules.created_by 
    IS 'ID Admin/User đã thiết lập quy tắc này.';

-- ================
-- ORDERS SCHEMA
-- ================
--chi tiết sản phẩm trong đơn (mua cái gì, bao nhiêu, giá bao nhiêu).
CREATE TABLE IF NOT EXISTS orders.order_product (
    product_id SERIAL PRIMARY KEY,
    product_code VARCHAR(10) UNIQUE,
    product_name VARCHAR(255),
    description TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) DEFAULT 0,
    ngaynhap DATE DEFAULT CURRENT_DATE,
    ngayhethan DATE,
    trangthai BOOLEAN DEFAULT TRUE,
    CHECK (ngayhethan IS NULL OR ngayhethan >= ngaynhap)
);

COMMENT ON TABLE orders.order_product IS 'Chi tiết sản phẩm trong đơn hàng';
COMMENT ON COLUMN orders.order_product.description IS 'Mô tả sản phẩm trong đơn hàng';

--(ai đặt, khi nào, tổng tiền, nguồn)
CREATE TABLE IF NOT EXISTS orders.orders (
    order_id SERIAL PRIMARY KEY,
    order_code VARCHAR(10) UNIQUE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),          -- người tạo đơn
    customer_id INT REFERENCES member.customer(customer_id),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(15),
	customer_email VARCHAR(100),
	customer_address TEXT,
	user_id INT REFERENCES auth.users(user_id), -- người giới thiệu
	product_id INT REFERENCES orders.order_product(product_id),
	product_name VARCHAR(255),
	quantity INT NOT NULL DEFAULT 1,
	unit_price NUMERIC(15,2) NOT NULL, -- copy từ products.price tại thời điểm mua
    total_amount NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- Nguồn đơn hàng
    order_source VARCHAR(20) NOT NULL CHECK (order_source IN ('Khách hàng', 'Nhà phân phối', 'Đại lý', 'Cộng tác viên')),

    -- Quan hệ vai trò
    npp_id INT REFERENCES member.nhaphanphoi(npp_id),
    agent_id INT REFERENCES member.agent(agent_id),
    collaborator_id INT REFERENCES member.ctv(ctv_id),

    -- Trạng thái đơn
    status SMALLINT DEFAULT 1,

    -- Ràng buộc đảm bảo logic đúng với vai trò
    CONSTRAINT chk_source_correct CHECK (
           (order_source = 'Khách hàng' AND npp_id IS NULL AND agent_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'Nhà phân phối' AND npp_id IS NOT NULL AND agent_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'Đại lý' AND agent_id IS NOT NULL AND npp_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'Cộng tác viên' AND collaborator_id IS NOT NULL AND npp_id IS NULL AND agent_id IS NULL)
    )
);

COMMENT ON TABLE orders.orders IS 'Bảng lưu thông tin đơn hàng';
COMMENT ON COLUMN orders.orders.order_source IS 'Nguồn tạo đơn hàng: system/NPP/Agent/CTV';
COMMENT ON COLUMN orders.orders.total_amount IS 'Tổng tiền đơn hàng';
COMMENT ON COLUMN orders.orders.status IS 'Trạng thái: 1=Hoạt động, 0=Hủy';

ALTER TABLE orders.order_product
ADD COLUMN order_id INT,
ADD CONSTRAINT fk_order_product_order
FOREIGN KEY (order_id)
REFERENCES orders.orders(order_id)
ON DELETE CASCADE;

--Theo dõi lịch sử thay đổi
CREATE TABLE IF NOT EXISTS orders.order_origin_log (
    log_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders.orders(order_id) ON DELETE CASCADE,
    old_source VARCHAR(50),
    new_source VARCHAR(50),
    old_agent INT,
    new_agent INT,
    old_collaborator INT,
    new_collaborator INT,
	changed_reason VARCHAR(200),
    changed_by VARCHAR(100), -- user_id hoặc admin thay đổi
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================
-- DISPLAY SCHEMA
-- ================
-- Bảng thống kê dashboard
CREATE TABLE display.dashboard_statistics (
    stat_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    stat_date DATE DEFAULT CURRENT_DATE,
    total_orders INT DEFAULT 0,
    total_sales NUMERIC(15,2) DEFAULT 0,
    total_commission NUMERIC(15,2) DEFAULT 0,
    customer_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng cấu hình dashboard theo user
CREATE TABLE display.dashboard_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    display_widgets JSON,
    widget_positions JSON,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================
-- SEED DATA
-- ================
INSERT INTO auth.roles (role_name, description) 
    VALUES ('Admin', 'Quản trị hệ thống'),
           ('Nhà phân phối', 'Nhà phân phối'),
           ('Đại lý', 'Đại lý'),
           ('Cộng tác viên', 'Cộng tác viên'),
		   ('Khách hàng', 'Khách hàng')
ON CONFLICT (role_name) DO NOTHING;


-- ================
-- VIEW
-- ================
-- Tạo view giúp dễ tra cứu nguồn đơn
CREATE OR REPLACE VIEW orders.order_origin_view AS
SELECT
  o.order_id,
  o.order_code,
  o.order_date,
  o.total_amount,
  o.created_by,
  o.customer_id,
  o.customer_name,
  o.customer_phone,
  o.order_source,
  o.npp_id,
  o.agent_id,
  o.collaborator_id,
  o.status,

  -- Gắn nhãn nguồn đơn
  CASE
    WHEN o.order_source = 'Khách hàng' THEN 'Khách hàng'
    WHEN o.order_source = 'Nhà phân phối'      THEN 'Qua nhà phân phối'
    WHEN o.order_source = 'Đại lý'    THEN 'Qua đại lý'
    WHEN o.order_source = 'Cộng tác viên'      THEN 'Qua Cộng tác viên'
    ELSE 'Không xác định'
  END AS origin_label,

  -- Tên người/tổ chức tạo đơn
  CASE
    WHEN o.order_source = 'Khách hàng' THEN cust.customer_name
    WHEN o.order_source = 'Nhà phân phối'    THEN npp.npp_name
    WHEN o.order_source = 'Đại lý'  THEN a.agent_name
    WHEN o.order_source = 'Cộng tác viên'    THEN ctv.ctv_name
    ELSE NULL
  END AS origin_name,

  -- Kiểu nguồn (phục vụ filter, API, FE)
  CASE
    WHEN o.order_source = 'Khách hàng' THEN 'Khách hàng'
    WHEN o.order_source = 'Nhà phân phối'    THEN 'Nhà phân phối'
    WHEN o.order_source = 'Đại lý'  THEN 'Đại lý'
    WHEN o.order_source = 'Cộng tác viên'    THEN 'Cộng tác viên'
    ELSE 'unknown'
  END AS origin_type,

  -- Các cột tên riêng từ bảng liên kết (nếu muốn lấy thêm)
  npp.npp_name,
  a.agent_name,
  ctv.ctv_name,
  cust.customer_name AS cust_customer_name

FROM orders.orders o
LEFT JOIN member.nhaphanphoi npp ON npp.npp_id = o.npp_id
LEFT JOIN member.agent a ON a.agent_id = o.agent_id
LEFT JOIN member.ctv ctv ON ctv.ctv_id = o.collaborator_id
LEFT JOIN member.customer cust ON cust.customer_id = o.customer_id;

--tạo view xem số dư
CREATE OR REPLACE VIEW user_balance AS
SELECT 
    u.user_id,
    u.username,
    COALESCE(SUM(h.tienhoahong), 0) AS tong_hoahong,
    COALESCE((
        SELECT SUM(w.amount)
        FROM transactions.withdraw_requests w
        WHERE w.user_id = u.user_id AND w.status = 'Approved'
    ), 0) AS tong_ruttien,
    COALESCE(SUM(h.tienhoahong), 0) 
        - COALESCE((
            SELECT SUM(w.amount)
            FROM transactions.withdraw_requests w
            WHERE w.user_id = u.user_id AND w.status = 'Approved'
        ), 0) AS sodu_khadung
FROM auth.users u
LEFT JOIN transactions.hoahong h ON u.user_id = h.user_id
GROUP BY u.user_id, u.username;

SELECT * FROM user_balance;


-- View tổng hợp dashboard
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT 
    u.user_id,
    u.username,
    r.role_name,
    -- Thống kê đơn hàng
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_sales,
    COUNT(DISTINCT o.customer_name) as total_customers,
    -- Thống kê hoa hồng
    SUM(h.tienhoahong) as total_commission,
    -- Thống kê sản phẩm
    COUNT(DISTINCT o.product_id) as unique_products_sold,
    -- Tính toán
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(DISTINCT o.order_id)::FLOAT / 
        NULLIF(COUNT(DISTINCT DATE_TRUNC('day', o.order_date)), 0) as avg_daily_orders
FROM auth.users u
LEFT JOIN auth.roles r ON u.role_id = r.role_id
LEFT JOIN orders.orders o ON u.user_id = o.user_id
LEFT JOIN transactions.hoahong h ON u.user_id = h.user_id
GROUP BY u.user_id, u.username, r.role_name;


-- View thống kê theo ngày
CREATE OR REPLACE VIEW daily_statistics AS
SELECT 
    DATE_TRUNC('day', o.order_date)::DATE as stat_date,
    o.user_id,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_sales,
    COUNT(DISTINCT o.customer_name) as unique_customers,
    SUM(o.quantity) as total_products_sold
FROM orders.orders o
GROUP BY DATE_TRUNC('day', o.order_date)::DATE, o.user_id;

-- View thống kê theo tháng
CREATE OR REPLACE VIEW monthly_statistics AS
SELECT 
    DATE_TRUNC('month', o.order_date)::DATE as stat_month,
    o.user_id,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_sales,
    COUNT(DISTINCT o.customer_name) as unique_customers,
    SUM(o.quantity) as total_products_sold,
    AVG(o.total_amount) as avg_order_value
FROM orders.orders o
GROUP BY DATE_TRUNC('month', o.order_date)::DATE, o.user_id;

-- View top sản phẩm bán chạy
CREATE OR REPLACE VIEW top_products AS
SELECT 
    p.product_id,
    p.product_name,
    COUNT(o.order_id) as order_count,
    SUM(o.quantity) as total_quantity,
    SUM(o.total_amount) as total_revenue
FROM orders.order_product p
JOIN orders.orders o ON p.product_id = o.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_quantity DESC;


-- ================
-- SEQUENCE
-- ================
CREATE SEQUENCE IF NOT EXISTS member.agent_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS member.ctv_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS member.npp_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS member.customer_code_seq START 1;

CREATE SEQUENCE IF NOT EXISTS orders.order_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS orders.order_product_code_seq START 1;

-- ================
-- FUNCTION
-- ================
--Hàm kiểm tra 1 order (mô tả nguồn + validation)
CREATE OR REPLACE FUNCTION orders.check_order_origin(p_order_id INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  o RECORD;
  msg TEXT;
  origin_name TEXT;
BEGIN
  -- Lấy thông tin đơn hàng + nguồn
  SELECT 
    o.*,
    a.agent_name,
    ctv.ctv_name,
    npp.npp_name,
    cust.customer_name AS cust_name
  INTO o
  FROM orders.orders o
  LEFT JOIN member.agent a ON a.agent_id = o.agent_id
  LEFT JOIN member.ctv ctv ON ctv.ctv_id = o.collaborator_id
  LEFT JOIN member.nhaphanphoi npp ON npp.npp_id = o.npp_id
  LEFT JOIN member.customer cust ON cust.customer_id = o.customer_id
  WHERE o.order_id = p_order_id;

  IF NOT FOUND THEN
    RETURN format('❌ Order %s: Không tìm thấy đơn hàng.', p_order_id);
  END IF;

  -- Xác định nguồn & mô tả
  CASE o.order_source
    WHEN 'Khách hàng' THEN
      msg := format('✅ Order %s: Phát sinh trực tiếp từ khách hàng (customer_id=%s, tên=%s)', 
                    o.order_id, o.customer_id, COALESCE(o.cust_name, o.customer_name));

    WHEN 'Nhà phân phối' THEN
      msg := format('✅ Order %s: Phát sinh qua Nhà phân phối (npp_id=%s, tên=%s)', 
                    o.order_id, o.npp_id, COALESCE(o.npp_name, 'Không rõ'));

    WHEN 'Đại lý' THEN
      msg := format('✅ Order %s: Phát sinh qua Đại lý (agent_id=%s, tên=%s)', 
                    o.order_id, o.agent_id, COALESCE(o.agent_name, 'Không rõ'));

    WHEN 'Cộng tác viên' THEN
      msg := format('✅ Order %s: Phát sinh qua Cộng tác viên (ctv_id=%s, tên=%s, agent_id=%s)', 
                    o.order_id, o.collaborator_id, COALESCE(o.ctv_name, 'Không rõ'), o.agent_id);

    ELSE
      msg := format('⚠️ Order %s: Nguồn không rõ (%s)', o.order_id, o.order_source);
  END CASE;

  -- Kiểm tra logic hợp lệ giữa các khóa liên kết
  IF (o.order_source = 'Khách hàng' AND (o.agent_id IS NOT NULL OR o.collaborator_id IS NOT NULL OR o.npp_id IS NOT NULL))
     OR (o.order_source = 'Nhà phân phối' AND (o.npp_id IS NULL OR o.agent_id IS NOT NULL OR o.collaborator_id IS NOT NULL))
     OR (o.order_source = 'Đại lý' AND (o.agent_id IS NULL OR o.npp_id IS NOT NULL OR o.collaborator_id IS NOT NULL))
     OR (o.order_source = 'Cộng tác viên' AND (o.collaborator_id IS NULL OR o.agent_id IS NULL OR o.npp_id IS NOT NULL))
  THEN
    msg := msg || E'\n⚠️ LƯU Ý: Dữ liệu có vẻ không hợp lệ theo rule (Khách hàng/Nhà phân phối/Đại lý/Cộng tác viên).';
  END IF;

  RETURN msg;
END;
$$;



-- FUNCTION thêm đồng bộ user_insert_member
CREATE OR REPLACE FUNCTION fn_user_insert_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Nhà phân phối
    IF NEW.role_id = (SELECT role_id FROM auth.roles WHERE role_name = 'Nhà phân phối') THEN
        INSERT INTO member.nhaphanphoi (npp_code, npp_name, email, phone)
        VALUES (
            'NPP' || LPAD(NEW.user_id::TEXT, 5, '0'),
            NEW.username,
            NEW.email,
            NEW.phone
        );

    -- Đại lý
    ELSIF NEW.role_id = (SELECT role_id FROM auth.roles WHERE role_name = 'Đại lý') THEN
        INSERT INTO member.agent (agent_code, agent_name, user_id, phone)
        VALUES (
            'AG' || LPAD(NEW.user_id::TEXT, 5, '0'),
            NEW.username,
            NEW.user_id,
            NEW.phone
        );

    -- Cộng tác viên
    ELSIF NEW.role_id = (SELECT role_id FROM auth.roles WHERE role_name = 'Cộng tác viên') THEN
        INSERT INTO member.ctv (ctv_code, ctv_name, user_id, phone)
        VALUES (
            'CTV' || LPAD(NEW.user_id::TEXT, 5, '0'),
            NEW.username,
            NEW.user_id,
			NEW.phone
        );

    -- Khách hàng
    ELSIF NEW.role_id = (SELECT role_id FROM auth.roles WHERE role_name = 'Khách hàng') THEN
        INSERT INTO member.customer (customer_code, customer_name, phone, email)
        VALUES (
            'KH' || LPAD(NEW.user_id::TEXT, 5, '0'),
            NEW.username,
            NEW.phone,
            NEW.email
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- FUNCTION update đồng bộ user_update_member
CREATE OR REPLACE FUNCTION fn_user_update_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu role bị thay đổi → xóa bản cũ và tạo mới tương ứng
    IF NEW.role_id <> OLD.role_id THEN
        PERFORM fn_user_delete_member();  -- gọi hàm xóa bản cũ
        PERFORM fn_user_insert_member();  -- tạo bản mới theo role mới
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- FUNCTION xóa đồng bộ user_delete_member
CREATE OR REPLACE FUNCTION fn_user_delete_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Xóa ở bảng tương ứng nếu tồn tại
    DELETE FROM member.agent WHERE user_id = OLD.user_id;
    DELETE FROM member.ctv WHERE user_id = OLD.user_id;
    DELETE FROM member.customer WHERE email = OLD.email;
    DELETE FROM member.nhaphanphoi WHERE email = OLD.email;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- trigger xóa ngược (xóa member thì xóa user)
CREATE OR REPLACE FUNCTION member.delete_user_when_member_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE user_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng cho từng bảng
CREATE TRIGGER trg_delete_user_when_agent_deleted
AFTER DELETE ON member.agent
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();

CREATE TRIGGER trg_delete_user_when_ctv_deleted
AFTER DELETE ON member.ctv
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();


--Tạo hàm sinh mã agent tự động
CREATE OR REPLACE FUNCTION generate_agent_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    -- Lấy giá trị tiếp theo từ sequence
    next_val := nextval('member.agent_code_seq');

    -- Gán mã tự động
    NEW.agent_code := 'AG' || LPAD(next_val::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--hàm sinh mã tự động cho ctv
CREATE OR REPLACE FUNCTION generate_ctv_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    -- Lấy giá trị tiếp theo
    next_val := nextval('member.ctv_code_seq');

    -- Sinh mã CTV + 5 chữ số
    NEW.ctv_code := 'CTV' || LPAD(next_val::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- hàm sinh mã tự động cho NPP
CREATE OR REPLACE FUNCTION generate_npp_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    -- Lấy giá trị tiếp theo trong sequence
    next_val := nextval('member.npp_code_seq');

    -- Sinh mã dạng NPP + 5 chữ số, ví dụ: NPP001
    NEW.npp_code := 'NPP' || LPAD(next_val::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hàm sinh mã tự động cho customer
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    -- Lấy giá trị tiếp theo từ sequence
    next_val := nextval('member.customer_code_seq');

    -- Gán mã dạng KH + 3 chữ số (ví dụ: KH001)
    NEW.customer_code := 'KH' || LPAD(next_val::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hàm sinh mã tự động cho orders.orders
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('orders.order_code_seq');
    NEW.order_code := 'DH' || LPAD(next_val::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hàm sinh mã tự động cho orders.order_product
CREATE OR REPLACE FUNCTION generate_order_product_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('orders.order_product_code_seq');
    NEW.product_code := 'SP' || LPAD(next_val::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---- hàm Khi thêm / sửa / xóa sản phẩm trong đơn (orders.order_product), trigger sẽ cập nhật lại cột product_name của đơn tương ứng.
CREATE OR REPLACE FUNCTION update_order_product_names()
RETURNS TRIGGER AS $$
DECLARE
    product_list TEXT;
BEGIN
    -- Ghép tên tất cả sản phẩm thuộc đơn hàng
    SELECT string_agg(product_name, ', ')
    INTO product_list
    FROM orders.order_product
    WHERE order_id = NEW.order_id;

    -- Cập nhật lại vào bảng orders
    UPDATE orders.orders
    SET product_name = product_list
    WHERE order_id = NEW.order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function ghi log tự động khi thêm hoặc cập nhật đơn hàng
CREATE OR REPLACE FUNCTION orders.log_order_origin_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- 🟢 Khi thêm mới đơn hàng
  IF TG_OP = 'INSERT' THEN
    INSERT INTO orders.order_origin_log(
        order_id,
        old_source, new_source,
        old_agent, new_agent,
        old_collaborator, new_collaborator,
        changed_reason,
        changed_by
    )
    VALUES (
        NEW.order_id,
        NULL, NEW.order_source,
        NULL, NEW.agent_id,
        NULL, NEW.collaborator_id,
        'Tạo mới đơn hàng',
        NEW.created_by  -- nếu bảng orders có cột này
    );
    RETURN NEW;

  -- 🟡 Khi cập nhật đơn hàng
  ELSIF TG_OP = 'UPDATE' THEN
    -- Ghi log chỉ khi có thay đổi order_source, agent hoặc collaborator
    IF (OLD.order_source IS DISTINCT FROM NEW.order_source)
       OR (OLD.agent_id IS DISTINCT FROM NEW.agent_id)
       OR (OLD.collaborator_id IS DISTINCT FROM NEW.collaborator_id) THEN

      INSERT INTO orders.order_origin_log(
          order_id,
          old_source, new_source,
          old_agent, new_agent,
          old_collaborator, new_collaborator,
          changed_reason,
          changed_by
      )
      VALUES (
          NEW.order_id,
          OLD.order_source, NEW.order_source,
          OLD.agent_id, NEW.agent_id,
          OLD.collaborator_id, NEW.collaborator_id,
          'Thay đổi nguồn đơn hàng',
          NEW.updated_by  -- hoặc NULL nếu không có thông tin người sửa
      );
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

--Hàm tính hoa hồng
CREATE OR REPLACE FUNCTION calc_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_role_id INT;
    v_sales NUMERIC(15,2);
    v_rate NUMERIC(5,2);
BEGIN
    -- 1. Lấy role_id của user
    SELECT role_id INTO v_role_id
    FROM auth.users
    WHERE user_id = NEW.user_id;

    -- 2. Tính doanh số hiện tại của user trong tháng này (bao gồm cả đơn mới)
    SELECT COALESCE(SUM(total_amount), 0) + NEW.total_amount
    INTO v_sales
    FROM orders.orders
    WHERE user_id = NEW.user_id
      AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', NEW.order_date);

    -- 3. Lấy commission_rate phù hợp trong commission_rules
    SELECT commission_rate INTO v_rate
    FROM transactions.commission_rules
    WHERE role_id = v_role_id
      AND (min_sales IS NULL OR v_sales >= min_sales)
      AND (max_sales IS NULL OR v_sales < max_sales)
      AND (start_date IS NULL OR NEW.order_date >= start_date)
      AND (end_date IS NULL OR NEW.order_date <= end_date OR end_date IS NULL)
    ORDER BY commission_rate DESC
    LIMIT 1;

    -- Nếu không tìm thấy rule thì mặc định = 0%
    IF v_rate IS NULL THEN
        v_rate := 0;
    END IF;

    -- 4. Upsert vào bảng hoahong
    INSERT INTO transactions.hoahong (user_id, thang, nam, doanhso, tile)
    VALUES (NEW.user_id, EXTRACT(MONTH FROM NEW.order_date), EXTRACT(YEAR FROM NEW.order_date), v_sales, v_rate)
    ON CONFLICT (user_id, thang, nam)
    DO UPDATE SET
        doanhso = v_sales,
        tile = v_rate;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Hàm xử lý rút tiền
CREATE OR REPLACE FUNCTION process_withdraw_request()
RETURNS TRIGGER AS $$
DECLARE
    v_total_hoahong NUMERIC(15,2);
    v_total_ruttien NUMERIC(15,2);
BEGIN
    -- Chỉ chạy khi Admin duyệt (Approved)
    IF NEW.status = 'Approved' THEN
        -- 1. Tính tổng hoa hồng hiện có của user
        SELECT COALESCE(SUM(tienhoahong), 0)
        INTO v_total_hoahong
        FROM transactions.hoahong
        WHERE user_id = NEW.user_id;

        -- 2. Tính tổng đã rút trước đó
        SELECT COALESCE(SUM(amount), 0)
        INTO v_total_ruttien
        FROM transactions.withdraw_requests
        WHERE user_id = NEW.user_id
          AND status = 'Approved'
          AND request_id <> NEW.request_id;

        -- 3. Kiểm tra số dư khả dụng
        IF (v_total_hoahong - v_total_ruttien) < NEW.amount THEN
            RAISE EXCEPTION 'Số dư hoa hồng không đủ để rút. Tổng khả dụng: %, Yêu cầu rút: %',
                (v_total_hoahong - v_total_ruttien), NEW.amount;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function cập nhật thống kê dashboard
CREATE OR REPLACE FUNCTION update_dashboard_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Cập nhật hoặc thêm mới thống kê
    INSERT INTO dashboard_statistics (
        user_id,
        stat_date,
        total_orders,
        total_sales,
        total_commission,
        customer_count
    )
    SELECT 
        NEW.user_id,
        CURRENT_DATE,
        COUNT(DISTINCT o.order_id),
        SUM(o.total_amount),
        SUM(h.tienhoahong),
        COUNT(DISTINCT o.customer_name)
    FROM orders.orders o
    LEFT JOIN transactions.hoahong h ON h.user_id = o.user_id 
        AND EXTRACT(MONTH FROM o.order_date) = h.thang 
        AND EXTRACT(YEAR FROM o.order_date) = h.nam
    WHERE o.user_id = NEW.user_id
    AND DATE_TRUNC('day', o.order_date) = CURRENT_DATE
    GROUP BY NEW.user_id, CURRENT_DATE
    ON CONFLICT (user_id, stat_date)
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_sales = EXCLUDED.total_sales,
        total_commission = EXCLUDED.total_commission,
        customer_count = EXCLUDED.customer_count;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================
-- TRIGGER
-- ================
-- trigger sinh code cho agent
CREATE TRIGGER trg_generate_agent_code
BEFORE INSERT ON member.agent
FOR EACH ROW
EXECUTE FUNCTION generate_agent_code();

-- trigger sinh code cho CTV
CREATE TRIGGER trg_generate_ctv_code
BEFORE INSERT ON member.ctv
FOR EACH ROW
EXECUTE FUNCTION generate_ctv_code();

-- trigger sinh code cho NPP
CREATE TRIGGER trg_generate_npp_code
BEFORE INSERT ON member.nhaphanphoi
FOR EACH ROW
EXECUTE FUNCTION generate_npp_code();

-- trigger sinh code cho customer
CREATE TRIGGER trg_generate_customer_code
BEFORE INSERT ON member.customer
FOR EACH ROW
EXECUTE FUNCTION generate_customer_code();

--  triger sinh code cho orders.orders
CREATE TRIGGER trg_generate_order_code
BEFORE INSERT ON orders.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_code();

--  triger sinh code cho orders.product
CREATE TRIGGER trg_generate_order_product_code
BEFORE INSERT ON orders.order_product
FOR EACH ROW
EXECUTE FUNCTION generate_order_product_code();

----trigger cho các sự kiện trong orders.order_product
-- Khi thêm
CREATE TRIGGER trg_update_order_product_names_insert
AFTER INSERT ON orders.order_product
FOR EACH ROW
EXECUTE FUNCTION update_order_product_names();

-- Khi sửa
CREATE TRIGGER trg_update_order_product_names_update
AFTER UPDATE ON orders.order_product
FOR EACH ROW
EXECUTE FUNCTION update_order_product_names();

-- Khi xóa
CREATE TRIGGER trg_update_order_product_names_delete
AFTER DELETE ON orders.order_product
FOR EACH ROW
EXECUTE FUNCTION update_order_product_names();


--Sau mỗi thao tác INSERT hoặc UPDATE, trigger sẽ tự động gọi function log_order_origin_change().
--không cần viết logic logging ở phía ứng dụng (BE/FE), mà database sẽ tự đảm nhiệm.
CREATE TRIGGER trg_order_origin_log
AFTER INSERT OR UPDATE ON orders.orders
FOR EACH ROW
EXECUTE FUNCTION orders.log_order_origin_change();

-- Khi thêm user
CREATE TRIGGER trg_user_insert_member
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION fn_user_insert_member();

-- Khi cập nhật user
CREATE TRIGGER trg_user_update_member
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION fn_user_update_member();

-- Khi xóa user;
CREATE TRIGGER trg_user_delete_member
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION fn_user_delete_member();

-- Xóa user khi xóa đại lý
CREATE TRIGGER trg_delete_user_when_agent_deleted
AFTER DELETE ON member.agent
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();

-- Xóa user khi xóa cộng tác viên
CREATE TRIGGER trg_delete_user_when_ctv_deleted
AFTER DELETE ON member.ctv
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();

--  Xóa user khi xóa khách hàng
CREATE TRIGGER trg_delete_user_when_customer_deleted
AFTER DELETE ON member.customer
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();

-- Xóa user khi xóa nhà phân phối
CREATE TRIGGER trg_delete_user_when_npp_deleted
AFTER DELETE ON member.nhaphanphoi
FOR EACH ROW
EXECUTE FUNCTION member.delete_user_when_member_deleted();

-- Trigger chạy khi thêm đơn hàng
CREATE TRIGGER trg_calc_commission
AFTER INSERT ON orders.orders
FOR EACH ROW EXECUTE FUNCTION calc_commission();

--Trigger của hàm sử lý rút tiền
CREATE TRIGGER trg_withdraw_request
BEFORE UPDATE ON transactions.withdraw_requests
FOR EACH ROW
EXECUTE FUNCTION process_withdraw_request();


-- ================
-- INDEX
-- ================
-- Index để tối ưu hiệu suất
CREATE INDEX idx_orders_date ON orders.orders(order_date);
CREATE INDEX idx_orders_user_date ON orders.orders(user_id, order_date);
CREATE INDEX idx_dashboard_stats_user_date ON display.dashboard_statistics(user_id, stat_date);

-- Thống kê số lượng + tổng tiền theo kênh phát sinh
SELECT origin_label, COUNT(*) AS order_count, SUM(total_amount) AS total_amount
FROM orders.order_origin_view
GROUP BY origin_label
ORDER BY order_count DESC;

-- Tìm orders có dữ liệu không hợp lệ (inconsistencies)
SELECT *
FROM orders.orders
WHERE (order_source = 'agent' AND agent_id IS NULL)
   OR (order_source = 'ctv'   AND collaborator_id IS NULL)
   OR (order_source = 'system' AND (agent_id IS NOT NULL OR collaborator_id IS NOT NULL));




INSERT INTO member.customer (customer_name, phone, email, diachi, ngaythamgia) 
VALUES
('Trần Trung Thành', '0912345678', 'coffee@gmail.com', 'Sài Gòn', DEFAULT);

INSERT INTO member.ctv (ctv_id, ctv_name, diachi)
VALUES (123, 'Thành', 'Sài Gòn', TRUE);


INSERT INTO orders.orders (customer_id, customer_name, customer_phone, order_source, agent_id)
VALUES (1, 'Trần Trung Thành', '0912345678', 'ctv', )
RETURNING order_id, order_code;

SELECT * FROM orders.order_product;
SELECT * FROM orders.orders;
SELECT * FROM auth.users;
SELECT * FROM member.nhaphanphoi;
SELECT * FROM member.agent;
SELECT * FROM auth.roles;
SELECT * FROM orders.order_origin_view;
SELECT * FROM member.customer;


-- -- INSERT INTO orders.orders 
-- -- (customer_id, customer_name, customer_phone, order_source, collaborator_id)
-- -- VALUES
-- -- (1, 'Trần Trung Thành', '0912345678', 'ctv', 123);


-- -- INSERT INTO member.agent (agent_name, diachi, masothue)
-- -- VALUES ('Đại lý Coffee', 'Sài Gòn', '0312345678');

-- -- SELECT * FROM member.agent;


-- -- ALTER TABLE member.agent
-- -- DROP CONSTRAINT agent_user_id_fkey,
-- -- ADD CONSTRAINT agent_user_id_fkey
-- -- FOREIGN KEY (user_id)
-- -- REFERENCES auth.users(user_id)
-- -- ON DELETE CASCADE
-- -- ON UPDATE CASCADE;

-- SELECT * FROM auth.users ORDER BY user_id DESC;
-- SELECT * FROM member.agent ORDER BY agent_id DESC;


-- SELECT tgname, tgrelid::regclass, tgfoid::regprocedure
-- FROM pg_trigger
-- WHERE NOT tgisinternal;

SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
WHERE conrelid = 'orders.orders'::regclass;



-- BƯỚC 1: Xóa view cũ đi (để tránh lỗi xung đột cột)
DROP VIEW IF EXISTS public.user_balance;

-- BƯỚC 2: Tạo lại view mới với đầy đủ logic (đã fix lỗi bảo mật Pending)
CREATE OR REPLACE VIEW public.user_balance AS
SELECT 
    u.user_id,
    u.username,
    u.email, -- Cột mới thêm vào đây
    
    -- Tổng kiếm được
    COALESCE(SUM(h.tienhoahong), 0) AS tong_hoahong,
    
    -- Tổng tiền đã rút (Approved) + Đang chờ rút (Pending)
    -- Trừ cả Pending để tránh lỗi rút tiền kép (Double Spending)
    COALESCE(w.tong_tru_tien, 0) AS tong_da_tru,
    
    -- Số dư khả dụng thực tế
    (COALESCE(SUM(h.tienhoahong), 0) - COALESCE(w.tong_tru_tien, 0)) AS sodu_khadung

FROM 
    web_auth.users u
LEFT JOIN 
    transactions.hoahong h ON u.user_id = h.user_id
LEFT JOIN (
    SELECT 
        user_id, 
        -- Cộng tổng tiền của cả trạng thái 'Approved' VÀ 'Pending'
        SUM(amount) as tong_tru_tien 
    FROM transactions.withdraw_requests
    WHERE status IN ('Approved', 'Pending') 
    GROUP BY user_id
) w ON u.user_id = w.user_id
GROUP BY 
    u.user_id, u.username, u.email, w.tong_tru_tien;

    INSERT INTO transactions.withdraw_requests (user_id, amount, status)
VALUES (36, 5000000, 'Pending');

INSERT INTO transactions.withdraw_requests (user_id, amount, status, bank_name, bank_account_number, bank_account_holder, bank_id)
VALUES (43, 5000000, 'Pending', 'Ngân hàng TMCP Ngoại Thương Việt Nam', 1234567890, 'Chuyen', 1 );


    ALTER TABLE transactions.withdraw_requests
ADD COLUMN bank_name VARCHAR(100),           -- Tên ngân hàng (VD: Vietcombank)
ADD COLUMN bank_account_number VARCHAR(50),  -- Số tài khoản
ADD COLUMN bank_account_holder VARCHAR(100); -- Tên chủ tài khoản (VD: NGUYEN VAN A)

-- 1. Kiểm tra xem đã có danh sách ngân hàng chưa
SELECT * FROM transactions.banks;
-- (Nhớ ID của 1 ngân hàng, ví dụ: Vietcombank có bank_id = 1)

-- 2. Kiểm tra ví tiền của User (Ví dụ user_id = 36)
-- Nếu chưa có tiền, hãy "hack" nhẹ 1 dòng hoa hồng để có tiền mà test:
INSERT INTO transactions.hoahong (user_id, thang, nam, doanhso, tile)
VALUES (37, 12, 2024, 100000000, 10); 
-- (Cộng 10 triệu vào ví để test rút tiền)

-- 1. Đảm bảo User 37 tồn tại (Nếu chưa có thì tạo, nếu có rồi thì thôi)
INSERT INTO web_auth.users (user_id, username, email, password, role_id)
VALUES (67, 'test_user_67', 'test37@example.com', 'hash_password_dummy', 1)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Đảm bảo có danh sách Ngân hàng (Master Data)
-- Lưu ý: ID 1 = Vietcombank
INSERT INTO transactions.banks (bank_id, bank_code, short_name, bank_name)
VALUES (1, 'VCB', 'Vietcombank', 'Ngân hàng TMCP Ngoại Thương Việt Nam')
ON CONFLICT (bank_id) DO NOTHING;

-- 3. "Nạp tiền" vào ví cho User 37 (Thông qua bảng hoa hồng)
-- Doanh số 200tr, Tỉ lệ 10% => Hoa hồng 20 triệu
-- Lưu ý: KHÔNG insert cột tienhoahong vì nó là cột tự động tính (Generated Column)
INSERT INTO transactions.hoahong (user_id, thang, nam, doanhso, tile)
VALUES (68, 12, 2024, 200000000, 10);

SELECT * FROM transactions.withdraw_requests 
WHERE user_id = 68 
AND status IN ('Pending', 'Approved');

DELETE FROM transactions.withdraw_requests WHERE user_id = 37;
SELECT * FROM public.user_balance WHERE user_id = 37;

DELETE FROM transactions.hoahong WHERE user_id = 37;
INSERT INTO transactions.hoahong (user_id, thang, nam, doanhso, tile)
VALUES (37, 12, 2024, 200000000, 10);


SELECT * FROM public.user_balance WHERE user_id = 68;

SELECT bank_id, short_name, bank_name FROM transactions.banks;

CREATE TABLE transactions.banks (
    bank_id SERIAL PRIMARY KEY,           -- Khóa chính tự động tăng (1, 2, 3...)
    bank_code VARCHAR(20) NOT NULL UNIQUE,-- Mã ngân hàng (Vẫn phải là DUY NHẤT)
    bank_name VARCHAR(150) NOT NULL,      -- Tên đầy đủ
    short_name VARCHAR(50)                -- Tên viết tắt
);

-- 4. Thêm dữ liệu (Không cần nhập bank_id, hệ thống tự điền)
INSERT INTO transactions.banks (bank_code, short_name, bank_name) VALUES
('VCB', 'Vietcombank', 'Ngân hàng TMCP Ngoại Thương Việt Nam'),
('TCB', 'Techcombank', 'Ngân hàng TMCP Kỹ Thương Việt Nam'),
('MB', 'MBBank', 'Ngân hàng TMCP Quân Đội'),
('ACB', 'ACB', 'Ngân hàng TMCP Á Châu'),
('VPB', 'VPBank', 'Ngân hàng TMCP Việt Nam Thịnh Vượng'),
('ICB', 'VietinBank', 'Ngân hàng TMCP Công Thương Việt Nam'),
('BIDV', 'BIDV', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam');

ALTER TABLE transactions.withdraw_requests 
ADD COLUMN bank_id INT REFERENCES transactions.banks(bank_id);