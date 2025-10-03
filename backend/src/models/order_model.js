const pool = require("../config/database_config");

// Lấy tất cả orders (không join items)
const getAll = async () => {
  const result = await pool.query("SELECT * FROM orders.orders ORDER BY order_date DESC");
  return result.rows;
};

// Lấy 1 order theo id (không join items)
const getById = async (order_id) => {
  const result = await pool.query("SELECT * FROM orders.orders WHERE order_id = $1", [order_id]);
  return result.rows[0];
};

// Tạo order (chỉ tạo đơn, không tạo items)
const create = async ({ order_date, total_amount, created_by, customer_id, order_source, agent_id, collaborator_id, status }) => {
  const result = await pool.query(
    `INSERT INTO orders.orders (order_date, total_amount, created_by, customer_id, order_source, agent_id, collaborator_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING order_id`,
    [
      order_date || new Date(),
      total_amount || 0,
      created_by || null,
      customer_id || null,
      order_source,
      agent_id || null,
      collaborator_id || null,
      status ?? 1,
    ]
  );
  return result.rows[0].order_id;
};

// Update order
const update = async (order_id, updates) => {
  // Chỉ cho phép update những cột hợp lệ
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

  const keys = Object.keys(updates).filter((k) =>
    allowedFields.includes(k)
  );

  if (keys.length === 0) return null;

  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => updates[k]);
  values.push(order_id);

  const query = `
    UPDATE orders.orders
    SET ${setClauses}, updated_at = NOW()
    WHERE order_id = $${values.length}
    RETURNING *;
  `;

  const result = await pool.query(query, values);

  return result.rowCount ? result.rows[0] : null;
};


// Xóa order
const remove = async (order_id) => {
  const result = await pool.query("DELETE FROM orders.orders WHERE order_id = $1", [order_id]);
  return result.rowCount;
};

// Tạo order kèm items (transaction)
// Tạo order kèm items (transaction)
const createOrderWithItems = async ({ order, items }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert order
    const insertOrderText = `
      INSERT INTO orders.orders (
        total_amount, created_by, customer_name, customer_phone,
        order_source, agent_id, collaborator_id, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`;
    const orderValues = [
      order.total_amount || 0,
      order.created_by || null,
      order.customer_name || null,
      order.customer_phone || null,
      order.order_source || 'system',
      order.agent_id || null,
      order.collaborator_id || null,
      order.status || 1,
    ];
    const resOrder = await client.query(insertOrderText, orderValues);
    const createdOrder = resOrder.rows[0];

    // Insert items
    const insertItemText = `
      INSERT INTO orders.order_items (order_id, product_id, product_name, quantity, unit_price)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`;

    for (const it of items) {
      await client.query(insertItemText, [
        createdOrder.order_id,
        it.product_id,
        it.product_name || null,
        it.quantity || 1,
        it.unit_price || 0,
      ]);
    }

    // Recalculate total
    const totRes = await client.query(
      `SELECT COALESCE(SUM(quantity * unit_price),0) AS total 
       FROM orders.order_items WHERE order_id = $1`,
      [createdOrder.order_id]
    );
    const total = totRes.rows[0].total || 0;

    await client.query(
      `UPDATE orders.orders SET total_amount = $1 WHERE order_id = $2`,
      [total, createdOrder.order_id]
    );

    await client.query("COMMIT");

    // Trả về order kèm items
    const final = await client.query(
      `SELECT o.*, 
              COALESCE(json_agg(json_build_object(
                'order_item_id', oi.order_item_id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price
              )) FILTER (WHERE oi.order_item_id IS NOT NULL), '[]') AS items
       FROM orders.orders o
       LEFT JOIN orders.order_items oi ON oi.order_id = o.order_id
       WHERE o.order_id = $1
       GROUP BY o.order_id`,
      [createdOrder.order_id]
    );

    return final.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Lấy order kèm items
const getOrderById = async (order_id) => {
  const res = await pool.query(
    `SELECT o.*,
            COALESCE(json_agg(json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
     FROM orders.orders o
     LEFT JOIN orders.order_items oi ON oi.order_id = o.order_id
     WHERE o.order_id = $1
     GROUP BY o.order_id`,
    [order_id]
  );
  return res.rows[0];
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
    FROM orders.orders o
    LEFT JOIN orders.order_items oi ON oi.product_code = o.order_code`;

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

const getOrderOrigin = async (order_id) => {
  const res = await pool.query(
    `SELECT order_code, order_source, origin_label, origin_type, origin_name, agent_id, collaborator_id, customer_id, customer_name, agent_name, ctv_name 
     FROM orders.order_origin_view WHERE order_id = $1`, [order_id]);
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
