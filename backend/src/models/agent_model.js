const pool = require("../config/database_config");

const TABLE = `"member"."agent"`;

/**
 * 🧩 Lấy toàn bộ danh sách đại lý (không phân trang)
 */
const getAllAgents = async () => {
  const sql = `SELECT * FROM ${TABLE} ORDER BY agent_id DESC;`;
  const { rows } = await pool.query(sql);
  return rows;
};

/**
 *  Lấy danh sách đại lý (tìm kiếm + phân trang)
 */
const listAgents = async ({ search = "", limit = 50, page = 1 } = {}) => {
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  let sql = `SELECT * FROM ${TABLE}`;
  const params = [];

  if (search) {
    sql += ` WHERE agent_name ILIKE $1 OR masothue ILIKE $1`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY agent_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Number(limit), Number(offset));

  const { rows } = await pool.query(sql, params);
  return rows;
};

/**
 *  Tạo mới đại lý
 */
const createAgent = async ({ user_id, agent_name, diachi, masothue }) => {
  const sql = `
    INSERT INTO ${TABLE} (user_id, agent_name, diachi, masothue)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const params = [user_id || null, agent_name, diachi || null, masothue || null];
  const { rows } = await pool.query(sql, params);
  return rows[0];
};

/**
 * Lấy thông tin đại lý theo ID
 */
const getAgentById = async (agent_id) => {
  const sql = `SELECT * FROM ${TABLE} WHERE agent_id = $1;`;
  const { rows } = await pool.query(sql, [agent_id]);
  return rows[0];
};

/**
 *  Cập nhật thông tin đại lý
 */
const updateAgent = async (agent_id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) throw new Error("Không có dữ liệu để cập nhật.");

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = Object.values(fields);
  values.push(agent_id);

  const sql = `
    UPDATE ${TABLE}
    SET ${setClause}
    WHERE agent_id = $${keys.length + 1}
    RETURNING *;
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0];
};

/**
 *  Xóa đại lý
 */
const deleteAgent = async (agent_id) => {
  const sql = `DELETE FROM ${TABLE} WHERE agent_id = $1;`;
  await pool.query(sql, [agent_id]);
  return true;
};

/**
 *  Cập nhập nhiều Đại lý
 */
const updateManyAgents = async (agents = []) => {
  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error("Không có dữ liệu đại lý để cập nhật.");
  }

  const results = await Promise.all(
    agents.map(async (agent) => {
      const { agent_id, ...fields } = agent;
      if (!agent_id) throw new Error("Thiếu agent_id trong một đối tượng cập nhật.");

      const keys = Object.keys(fields);
      if (keys.length === 0) return null;

      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
      const values = Object.values(fields);
      values.push(agent_id);

      const sql = `
        UPDATE ${TABLE}
        SET ${setClause}
        WHERE agent_id = $${keys.length + 1}
        RETURNING *;
      `;
      const { rows } = await pool.query(sql, values);
      return rows[0];
    })
  );

  return results.filter(Boolean);
};

module.exports = {
  getAllAgents,
  createAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
  listAgents,
  updateManyAgents,
};
