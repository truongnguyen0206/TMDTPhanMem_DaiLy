// const pool = require("../config/database_config");
const supabase = require("../config/supabaseClient");

// Lấy tất cả orders (không join items)
const getAll = async () => {
  const { data, error } = await supabase
    .from("orders_view")
    .select("*")
    .order("order_date", { ascending: false });

  if (error) throw error;
  return data;
};


// Lấy 1 order theo id (không join items)
const getById = async (order_id) => {
  const { data, error } = await supabase
    .from("orders_view")
    .select("*")
    .eq("order_id", order_id)
    .single();

  if (error) throw error;
  return data;
};


// Tạo order (chỉ tạo đơn, không tạo items)
const create = async (order) => {
  const { data, error } = await supabase
    .from("orders_view")
    .insert([{
      order_date: order.order_date || new Date(),
      total_amount: order.total_amount || 0,
      created_by: order.created_by || null,
      customer_id: order.customer_id || null,
      order_source: order.order_source || "system",
      agent_id: order.agent_id || null,
      collaborator_id: order.collaborator_id || null,
      status: order.status ?? 1
    }])
    .select("order_id")
    .single();

  if (error) throw error;
  return data.order_id;
};

// Update order
const update = async (order_id, updates) => {
  const allowedFields = [
    "customer_name",
    "customer_phone",
    "total_amount",
    "status",
    "order_source",
    "agent_id",
    "collaborator_id",
    "created_by"
  ];

  const validUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) validUpdates[key] = updates[key];
  }

  if (Object.keys(validUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("orders_view")
    .update(validUpdates)
    .eq("order_id", order_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};



// Xóa order
const remove = async (order_id) => {
  const { error } = await supabase
    .from("orders_view")
    .delete()
    .eq("order_id", order_id);

  if (error) throw error;
  return true;
};

// Tạo order kèm items (transaction)
const createOrderWithItems = async ({ order, items }) => {
  const { data, error } = await supabase.rpc("fn_create_order_with_items", {
    order_data: order,
    items: items,
  });

  if (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }

  return data;
};

// Lấy order kèm items
const getOrderById = async (order_id) => {
  const { data, error } = await supabase
    .from("orders_view") // 👈 nếu bạn tạo view `public.orders` trỏ tới `orders_view`
    .select(`
      *,
      order_product:order_product (
        id,
        product_id,
        product_name,
        quantity,
        unit_price
      )
    `)
    .eq("order_id", order_id)
    .maybeSingle(); // Lấy đúng 1 bản ghi hoặc null

  if (error) {
    console.error("❌ Error fetching order:", error);
    throw error;
  }

  // Đổi tên trường cho khớp với format cũ
  return {
    ...data,
    products: data?.order_product || [],
  };
};


// Lấy list orders kèm items (có filter agent_id, from, to, limit, offset)
const listOrders = async ({ limit = 50, offset = 0, agent_id, from, to } = {}) => {
  const params = [];
  const where = [];

  if (agent_id) {
    params.push(agent_id);
    where.push(`o.agent_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`o.order_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`o.order_date <= $${params.length}`);
  }

  let q = `
    SELECT o.*,
           COALESCE(json_agg(json_build_object(
             'code', oi.product_code,
             'product_id', oi.product_id,
             'product_name', oi.product_name,
             'quantity', oi.quantity,
             'unit_price', oi.unit_price
           )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
    FROM orders_view o
    LEFT JOIN orders.order_product oi ON oi.product_code = o.order_code`;

  if (where.length) q += ` WHERE ${where.join(" AND ")}`;
  q += ` GROUP BY o.order_id ORDER BY o.order_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  params.push(limit, offset);
  const res = await pool.query(q, params);
  return res.rows;
};


const getOrdersWithOrigin = async ({ limit = 50, offset = 0, agent_id, from, to } = {}) => {
  let q = `SELECT * FROM orders.order_origin_view WHERE 1=1`;
  const params = [];
  if (agent_id) {
    params.push(agent_id);
    q += ` AND agent_id = $${params.length}`;
  }
  if (from) {
    params.push(from);
    q += ` AND order_date >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    q += ` AND order_date <= $${params.length}`;
  }
  params.push(limit);
  params.push(offset);
  q += ` ORDER BY order_date DESC LIMIT $${params.length-1} OFFSET $${params.length}`;
  const res = await pool.query(q, params);
  return res.rows;
};

const getOrderOrigin = async (order_code) => {
  const res = await pool.query(
    `SELECT order_code, order_source, origin_label, origin_type, origin_name, agent_id, collaborator_id, customer_id, customer_name, agent_name, ctv_name 
     FROM orders.order_origin_view WHERE order_code = $1`, [order_code]);
  return res.rows[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  createOrderWithItems,
  getOrderById,
  listOrders,
  getOrdersWithOrigin,
  getOrderOrigin
};
