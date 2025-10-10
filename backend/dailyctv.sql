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
	agent_code VARCHAR(10) UNIQUE,
    agent_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    masothue VARCHAR(20),
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    trangthai BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS member.ctv (
    ctv_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(user_id),
	ctv_code VARCHAR(10) UNIQUE,
    ctv_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    ngaythamgia DATE DEFAULT CURRENT_DATE,
    trangthai BOOLEAN DEFAULT TRUE,
    agent_id INT REFERENCES member.agent(agent_id) -- gán CTV thuộc agent
);

CREATE TABLE IF NOT EXISTS member.nhaphanphoi (
    npp_id SERIAL PRIMARY KEY,
	npp_code VARCHAR(10) UNIQUE,
    npp_name VARCHAR(100) NOT NULL,
    diachi TEXT,
    sodienthoai VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS member.customer (
    customer_id SERIAL PRIMARY KEY,
	customer_code VARCHAR(10) UNIQUE,
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
	product_name TEXT,
	
    -- Nguồn đơn hàng
    order_source VARCHAR(20) NOT NULL CHECK (order_source IN ('customer','npp','agent','ctv')),

    -- Quan hệ vai trò
    npp_id INT REFERENCES member.nhaphanphoi(npp_id),
    agent_id INT REFERENCES member.agent(agent_id),
    collaborator_id INT REFERENCES member.ctv(ctv_id),

    -- Trạng thái đơn
    status SMALLINT DEFAULT 1,

    -- Ràng buộc đảm bảo logic đúng với vai trò
    CONSTRAINT chk_source_correct CHECK (
           (order_source = 'customer' AND npp_id IS NULL AND agent_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'npp'    AND npp_id IS NOT NULL AND agent_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'agent'  AND agent_id IS NOT NULL AND npp_id IS NULL AND collaborator_id IS NULL)
        OR (order_source = 'ctv'    AND collaborator_id IS NOT NULL AND npp_id IS NULL AND agent_id IS NULL)
    )
);

COMMENT ON TABLE orders.orders IS 'Bảng lưu thông tin đơn hàng';
COMMENT ON COLUMN orders.orders.order_source IS 'Nguồn tạo đơn hàng: system/NPP/Agent/CTV';
COMMENT ON COLUMN orders.orders.total_amount IS 'Tổng tiền đơn hàng';
COMMENT ON COLUMN orders.orders.status IS 'Trạng thái: 1=Hoạt động, 0=Hủy';


--chi tiết sản phẩm trong đơn (mua cái gì, bao nhiêu, giá bao nhiêu).
CREATE TABLE IF NOT EXISTS orders.order_product (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(10) UNIQUE,
    order_id INT NOT NULL REFERENCES orders.orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255),
    description TEXT,                  -- mô tả sản phẩm
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) DEFAULT 0
);

COMMENT ON TABLE orders.order_product IS 'Chi tiết sản phẩm trong đơn hàng';
COMMENT ON COLUMN orders.order_product.description IS 'Mô tả sản phẩm trong đơn hàng';

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
-- SEED DATA
-- ================
INSERT INTO auth.roles (role_name, description) 
    VALUES ('Admin', 'Quản trị hệ thống'),
           ('NPP', 'Nhà phân phối'),
           ('Agent', 'Đại lý'),
           ('CTV', 'Cộng tác viên'),
		   ('Customer', 'Khách hàng')
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
    WHEN o.order_source = 'customer' THEN 'Khách hàng'
    WHEN o.order_source = 'npp'      THEN 'Qua nhà phân phối'
    WHEN o.order_source = 'agent'    THEN 'Qua đại lý'
    WHEN o.order_source = 'ctv'      THEN 'Qua CTV'
    ELSE 'Không xác định'
  END AS origin_label,

  -- Tên người/tổ chức tạo đơn
  CASE
    WHEN o.order_source = 'customer' THEN cust.customer_name
    WHEN o.order_source = 'npp'    THEN npp.npp_name
    WHEN o.order_source = 'agent'  THEN a.agent_name
    WHEN o.order_source = 'ctv'    THEN ctv.ctv_name
    ELSE NULL
  END AS origin_name,

  -- Kiểu nguồn (phục vụ filter, API, FE)
  CASE
    WHEN o.order_source = 'customer' THEN 'customer'
    WHEN o.order_source = 'npp'    THEN 'npp'
    WHEN o.order_source = 'agent'  THEN 'agent'
    WHEN o.order_source = 'ctv'    THEN 'ctv'
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
    WHEN 'system' THEN
      msg := format('✅ Order %s: Phát sinh trực tiếp từ khách hàng (customer_id=%s, tên=%s)', 
                    o.order_id, o.customer_id, COALESCE(o.cust_name, o.customer_name));

    WHEN 'npp' THEN
      msg := format('✅ Order %s: Phát sinh qua Nhà phân phối (npp_id=%s, tên=%s)', 
                    o.order_id, o.npp_id, COALESCE(o.npp_name, 'Không rõ'));

    WHEN 'agent' THEN
      msg := format('✅ Order %s: Phát sinh qua Đại lý (agent_id=%s, tên=%s)', 
                    o.order_id, o.agent_id, COALESCE(o.agent_name, 'Không rõ'));

    WHEN 'ctv' THEN
      msg := format('✅ Order %s: Phát sinh qua CTV (ctv_id=%s, tên=%s, agent_id=%s)', 
                    o.order_id, o.collaborator_id, COALESCE(o.ctv_name, 'Không rõ'), o.agent_id);

    ELSE
      msg := format('⚠️ Order %s: Nguồn không rõ (%s)', o.order_id, o.order_source);
  END CASE;

  -- Kiểm tra logic hợp lệ giữa các khóa liên kết
  IF (o.order_source = 'customer' AND (o.agent_id IS NOT NULL OR o.collaborator_id IS NOT NULL OR o.npp_id IS NOT NULL))
     OR (o.order_source = 'npp' AND (o.npp_id IS NULL OR o.agent_id IS NOT NULL OR o.collaborator_id IS NOT NULL))
     OR (o.order_source = 'agent' AND (o.agent_id IS NULL OR o.npp_id IS NOT NULL OR o.collaborator_id IS NOT NULL))
     OR (o.order_source = 'ctv' AND (o.collaborator_id IS NULL OR o.agent_id IS NULL OR o.npp_id IS NOT NULL))
  THEN
    msg := msg || E'\n⚠️ LƯU Ý: Dữ liệu có vẻ không hợp lệ theo rule (customer/npp/agent/ctv).';
  END IF;

  RETURN msg;
END;
$$;


--Tạo hàm sinh mã agent tự động
CREATE OR REPLACE FUNCTION generate_agent_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
BEGIN
    -- Lấy giá trị tiếp theo từ sequence
    next_val := nextval('member.agent_code_seq');

    -- Gán mã tự động
    NEW.agent_code := 'AG' || LPAD(next_val::TEXT, 3, '0');

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

    -- Sinh mã CTV + 3 chữ số
    NEW.ctv_code := 'CTV' || LPAD(next_val::TEXT, 3, '0');

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

    -- Sinh mã dạng NPP + 3 chữ số, ví dụ: NPP001
    NEW.npp_code := 'NPP' || LPAD(next_val::TEXT, 3, '0');

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
    NEW.customer_code := 'KH' || LPAD(next_val::TEXT, 3, '0');

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
    NEW.order_code := 'DH' || LPAD(next_val::TEXT, 3, '0');
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
    NEW.product_code := 'SP' || LPAD(next_val::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hàm Khi thêm / sửa / xóa sản phẩm trong đơn (orders.order_product), trigger sẽ cập nhật lại cột product_name của đơn tương ứng.
CREATE OR REPLACE FUNCTION update_order_product_names()
RETURNS TRIGGER AS $$
DECLARE
    product_list TEXT;
BEGIN
    -- Ghép tên tất cả sản phẩm thuộc đơn hàng
    SELECT string_agg(product_name, ', ')
    INTO product_list
    FROM orders.order_product
    WHERE order_code = NEW.order_code;

    -- Cập nhật lại vào bảng orders
    UPDATE orders.orders
    SET product_name = product_list
    WHERE order_code = NEW.order_code;

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

--  triger sinh code cho orders.orders
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




INSERT INTO member.customer (customer_name, phone, email, diachi, ngaythamgia, trangthai) 
VALUES
('Trần Trung Thành', '0912345678', 'coffee@gmail.com', 'Sài Gòn', DEFAULT, TRUE);

INSERT INTO member.ctv (ctv_id, ctv_name, diachi, trangthai)
VALUES (123, 'Thành', 'Sài Gòn', TRUE);


INSERT INTO orders.orders (customer_id, customer_name, customer_phone, order_source, collaborator_id)
VALUES (1, 'Trần Trung Thành', '0912345678', 'ctv', 123)
RETURNING order_id, order_code;

SELECT * FROM orders.orders;
SELECT * FROM auth.users;
SELECT * FROM auth.users;
SELECT * FROM member.ctv
SELECT * FROM auth.roles
SELECT * FROM orders.order_origin_view

INSERT INTO orders.orders 
(customer_id, customer_name, customer_phone, order_source, collaborator_id)
VALUES
(1, 'Trần Trung Thành', '0912345678', 'ctv', 123);

