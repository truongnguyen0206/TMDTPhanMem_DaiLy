ALTER USER postgres WITH PASSWORD '123456';

-- Tạo schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS member;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS statistic;

-- ================
-- AUTH SCHEMA
-- ================
CREATE TABLE IF NOT EXISTS auth.roles (
    role_id SERIAL PRIMARY KEY,	
    role_name VARCHAR(50) UNIQUE NOT NULL, -- Admin, NhanVien, DaiLy, CTV,...
    description TEXT
);

CREATE TABLE IF NOT EXISTS auth.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role_id INT NOT NULL REFERENCES auth.roles(role_id),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================
-- MEMBER SCHEMA
-- ================
CREATE TABLE IF NOT EXISTS member.agent (
    agent_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    agent_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    masothue VARCHAR(20),
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    trangthai BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS member.ctv (
    ctv_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
    ctv_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    trangthai BOOLEAN DEFAULT TRUE,
    agent_id INT REFERENCES member.agent(agent_id) -- gán CTV thuộc agent
);

CREATE TABLE IF NOT EXISTS member.nhaphanphoi (
    npp_id SERIAL PRIMARY KEY,
    npp_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    sodienthoai VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS member.customer (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    diachi TEXT,
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    trangthai BOOLEAN DEFAULT TRUE
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

-- ================
-- ORDERS SCHEMA
-- ================
--(ai đặt, khi nào, tổng tiền, nguồn)
CREATE TABLE IF NOT EXISTS orders.orders (
    order_id SERIAL PRIMARY KEY,
	order_code VARCHAR(10) UNIQUE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(15,2) DEFAULT 0,
    created_by VARCHAR(100),          -- người tạo đơn
    customer_id INT REFERENCES member.customer(customer_id),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    order_source VARCHAR(20) NOT NULL CHECK (order_source IN ('system','agent','ctv')),
    agent_id INT REFERENCES member.agent(agent_id),
    collaborator_id INT REFERENCES member.ctv(ctv_id),
    status SMALLINT DEFAULT 1,
   CONSTRAINT chk_source_correct CHECK (
	   (order_source = 'agent'  AND agent_id IS NOT NULL AND collaborator_id IS NULL)
	OR (order_source = 'ctv'    AND collaborator_id IS NOT NULL AND agent_id IS NULL)
	OR (order_source = 'system' AND agent_id IS NULL AND collaborator_id IS NULL)
)
);


--chi tiết sản phẩm trong đơn (mua cái gì, bao nhiêu, giá bao nhiêu).
CREATE TABLE IF NOT EXISTS orders.order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders.orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) DEFAULT 0
);

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
    changed_by INT, -- user_id hoặc admin thay đổi
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ================
-- SEED DATA
-- ================
INSERT INTO auth.roles (role_name, description) 
    VALUES ('Admin', 'Quản trị hệ thống'),
           ('NhanVien', 'Nhân viên công ty'),
           ('DaiLy', 'Tài khoản đại lý'),
           ('CTV', 'Cộng tác viên')
ON CONFLICT (role_name) DO NOTHING;


-- Tạo view giúp dễ tra cứu nguồn đơn
CREATE OR REPLACE VIEW orders.order_origin_view AS
SELECT
  o.*,
  CASE
    WHEN o.order_source = 'system' THEN 'Khách hàng trực tiếp'
    WHEN o.order_source = 'agent'  THEN 'Qua đại lý'
    WHEN o.order_source = 'ctv'    THEN 'Qua CTV'
    ELSE 'Không xác định'
  END AS origin_label,
  CASE
    WHEN o.order_source = 'agent'  THEN a.agent_name
    WHEN o.order_source = 'ctv'    THEN ctv.ctv_name
    WHEN o.order_source = 'system' THEN cust.customer_name
    ELSE NULL
  END AS origin_name,
  CASE
    WHEN o.order_source = 'system' THEN 'customer'
    WHEN o.order_source = 'agent'  THEN 'agent'
    WHEN o.order_source = 'ctv'    THEN 'ctv'
    ELSE 'unknown'
  END AS origin_type,
  a.agent_name        AS agent_name,
  ctv.ctv_name        AS ctv_name,
  cust.customer_name  AS cust_customer_name
FROM orders.orders o
LEFT JOIN member.agent a ON a.agent_id = o.agent_id
LEFT JOIN member.ctv ctv ON ctv.ctv_id = o.collaborator_id
LEFT JOIN member.customer cust ON cust.customer_id = o.customer_id;


--Hàm kiểm tra 1 order (mô tả nguồn + validation)
CREATE OR REPLACE FUNCTION orders.check_order_origin(p_order_id INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  o RECORD;
  msg TEXT;
BEGIN
  SELECT * INTO o FROM orders.orders WHERE order_id = p_order_id;
  IF NOT FOUND THEN
    RETURN format('Order %s: Không tìm thấy order', p_order_id);
  END IF;

  IF o.order_source = 'system' THEN
    msg := format('Order %s: phát sinh trực tiếp từ KH (customer_id=%s, tên=%s)', o.order_id, o.customer_id, o.customer_name);
  ELSIF o.order_source = 'agent' THEN
    msg := format('Order %s: phát sinh qua ĐẠI LÝ (agent_id=%s)', o.order_id, o.agent_id);
  ELSIF o.order_source = 'ctv' THEN
    msg := format('Order %s: phát sinh qua CTV (ctv_id=%s, agent_id=%s)', o.order_id, o.collaborator_id, o.agent_id);
  ELSE
    msg := format('Order %s: nguồn không rõ (%s)', o.order_id, o.order_source);
  END IF;

  -- Kiểm tra tính hợp lệ về dữ liệu (cảnh báo)
  IF (o.order_source = 'agent' AND o.agent_id IS NULL)
     OR (o.order_source = 'ctv' AND o.collaborator_id IS NULL)
     OR (o.order_source = 'system' AND (o.agent_id IS NOT NULL OR o.collaborator_id IS NOT NULL))
  THEN
    msg := msg || ' -- LƯU Ý: dữ liệu có vẻ không hợp lệ theo rule (agent/ctv/system).';
  END IF;

  RETURN msg;
END;
$$;



--Bảng log + trigger (ghi lại khi insert/update nguồn thay đổi)
CREATE OR REPLACE FUNCTION orders.log_order_origin_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Khi thêm mới đơn hàng
  IF TG_OP = 'INSERT' THEN
    INSERT INTO orders.order_origin_log(order_id, old_source, new_source, old_agent, new_agent, old_collaborator, new_collaborator, changed_by)
    VALUES (NEW.order_id, NULL, NEW.order_source, NULL, NEW.agent_id, NULL, NEW.collaborator_id, NULL);
    RETURN NEW;

  -- Khi cập nhật đơn hàng
  ELSIF TG_OP = 'UPDATE' THEN
    -- Chỉ ghi log nếu có thay đổi source, agent, hoặc collaborator
    IF (OLD.order_source IS DISTINCT FROM NEW.order_source)
       OR (OLD.agent_id IS DISTINCT FROM NEW.agent_id)
       OR (OLD.collaborator_id IS DISTINCT FROM NEW.collaborator_id) THEN

      INSERT INTO orders.order_origin_log(order_id, old_source, new_source, old_agent, new_agent, old_collaborator, new_collaborator, changed_by)
      VALUES (NEW.order_id, OLD.order_source, NEW.order_source, OLD.agent_id, NEW.agent_id, OLD.collaborator_id, NEW.collaborator_id, NULL);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;



--Gắn vào bảng orders.orders.
--Sau mỗi thao tác INSERT hoặc UPDATE, trigger sẽ tự động gọi function log_order_origin_change().
--không cần viết logic logging ở phía ứng dụng (BE/FE), mà database sẽ tự đảm nhiệm.
CREATE TRIGGER trg_order_origin_log
AFTER INSERT OR UPDATE ON orders.orders
FOR EACH ROW
EXECUTE FUNCTION orders.log_order_origin_change();



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


--FUNCTION sinh mã đơn hàng
CREATE OR REPLACE FUNCTION orders.generate_order_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    last_code TEXT;
    last_num INT;
    new_code TEXT;
BEGIN
    -- Lấy mã đơn hàng lớn nhất hiện tại (theo số)
    SELECT order_code
    INTO last_code
    FROM orders.orders
    WHERE order_code ~ '^DH[0-9]+$'
    ORDER BY CAST(SUBSTRING(order_code, 3) AS INT) DESC
    LIMIT 1;

    -- Nếu chưa có đơn hàng nào -> bắt đầu từ 1
    IF last_code IS NULL THEN
        last_num := 0;
    ELSE
        last_num := CAST(SUBSTRING(last_code, 3) AS INT);
    END IF;

    -- Sinh mã mới dạng DHxxx (zero padding 3 chữ số)
    new_code := 'DH' || LPAD((last_num + 1)::TEXT, 3, '0');

    -- Gán vào NEW trước khi insert
    NEW.order_code := new_code;

    RETURN NEW;
END;
$$;

--TRIGGER mã đơn hàng
CREATE TRIGGER trg_generate_order_code
BEFORE INSERT ON orders.orders
FOR EACH ROW
WHEN (NEW.order_code IS NULL)  -- chỉ tự sinh nếu chưa có order_code
EXECUTE FUNCTION orders.generate_order_code();



INSERT INTO member.customer (customer_name, phone, email, diachi, ngaythamgia, trangthai) 
VALUES
('Trần Trung Thành', '0912345678', 'coffee@gmail.com', 'Sài Gòn', DEFAULT, TRUE);

INSERT INTO member.ctv (ctv_id, ctv_name, diachi, trangthai)
VALUES (123, 'Thành', 'Sài Gòn', TRUE);


INSERT INTO orders.orders (customer_id, customer_name, customer_phone, order_source, collaborator_id)
VALUES (1, 'Trần Trung Thành', '0912345678', 'ctv', 123)
RETURNING order_id, order_code;

SELECT * FROM orders.orders;
