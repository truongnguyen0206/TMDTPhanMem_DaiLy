/**
 * models/collaborator_model.js
 *
 * Data access layer for CTV (member.ctv).
 * Uses mysql2/promise pool provided by ../config/db.js
 */

const pool = require("../config/database_config");

const TABLE = 'member.ctv';


/**
 * Lấy danh sách CTV với paging, tìm kiếm và lọc theo agent.
 * @param {Object} opts
 */
async function getAllCTV(opts = {}) {
  const {
    agentId = null,
    search = '',
    limit = 50,
    page = 1,
  } = opts;

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  const params = [];
  let sql = `
    SELECT ctv_id, user_id, ctv_code, ctv_name, diachi,
           ngaythamgia, agent_id
    FROM ${TABLE}
    WHERE 1=1
  `;

  // Tạo biến đếm để đánh số placeholder $1, $2,...
  let idx = 1;

  if (agentId) {
    sql += ` AND agent_id = $${idx++}`;
    params.push(agentId);
  }

  if (search) {
    sql += ` AND (ctv_name ILIKE $${idx} OR ctv_code ILIKE $${idx + 1} OR diachi ILIKE $${idx + 2})`;
    const like = `%${search}%`;
    params.push(like, like, like);
    idx += 3;
  }

  sql += ` ORDER BY ngaythamgia DESC LIMIT $${idx++} OFFSET $${idx}`;
  params.push(Number(limit), Number(offset));

  const { rows } = await pool.query(sql, params);
  return rows;
}

/** Lấy CTV theo id */
async function getCTVById(ctvId) {
  const sql = `SELECT ctv_id, user_id, ctv_code, ctv_name, diachi,
    ngaythamgia, agent_id
    FROM ${TABLE} WHERE ctv_id = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [ctvId]);
  return rows[0] || null;
}

/** Lấy CTV theo ctv_code */
async function getCTVByCode(code) {
  const sql = `SELECT ctv_id FROM ${TABLE} WHERE ctv_code = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [code]);
  return rows[0] || null;
}

/**
 * Tạo CTV mới.
 * Chỉ đưa vào các cột tồn tại trong payload (để tận dụng default DB).
 */
async function createCTV(payload = {}) {
  const columns = [];
  const placeholders = [];
  const params = [];

  // required: ctv_name
  if (!payload.ctv_name) {
    throw new Error('ctv_name is required');
  }

  // optional fields
  const maybePushCTV = (col, val) => {
    if (typeof val !== 'undefined') {
      columns.push(col);
      placeholders.push(`$${params.length + 1}`);
      params.push(val);
    }
  };

  maybePushCTV('user_id', payload.user_id); 
  maybePushCTV('ctv_code', payload.ctv_code);
  maybePushCTV('ctv_name', payload.ctv_name);
  maybePushCTV('diachi', payload.diachi);
  maybePushCTV('ngaythamgia', payload.ngaythamgia); // if omitted DB will set default
  maybePushCTV('agent_id', payload.agent_id);

  const sql = `
    INSERT INTO ${TABLE} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *;
  `;

  const { rows } = await pool.query(sql, params);
  return rows[0]; // ✅ Trả lại bản ghi vừa insert
};

/**
 * Cập nhật CTV theo ctv_id (partial update).
 * payload chứa các cột cần cập nhật.
 */
async function updateCTV(ctvId, payload = {}) {
  const sets = [];
  const params = [];

  const allowed = ['user_id', 'ctv_code', 'ctv_name', 'diachi',
    'ngaythamgia', 'agent_id'];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      sets.push(`${key} = ?`);
      params.push(payload[key]);
    }
  }

  if (sets.length === 0) {
    // nothing to update
    return getCTVById(ctvId);
  }

  params.push(ctvId);
  const sql = `UPDATE ${TABLE} SET ${sets.join(', ')}
    WHERE ctv_id = ?`;

  const [result] = await pool.query(sql, params);
  if (result.affectedRows === 0) {
    return null;
  }
  return getCTVById(ctvId);
}

/** Soft delete (set trangthai = false) */
async function softDeleteCTV(ctvId) {
  const sql = `UPDATE ${TABLE} SET trangthai = 0 WHERE ctv_id = ?`;
  const [result] = await pool.query(sql, [ctvId]);
  return result.affectedRows > 0;
}

// /** Generate unique ctv_code like CTV123456 (tries several times) */
// async function generateUniqueCode(prefix = 'CTV', digits = 6) {
//   for (let attempt = 0; attempt < 6; attempt++) {
//     const rand = Math.floor(Math.random() * Math.pow(10, digits));
//     const pad = String(rand).padStart(digits, '0');
//     const code = `${prefix}${pad}`;
//     const exists = await getByCode(code);
//     if (!exists) return code;
//   }
//   throw new Error('Failed to generate unique ctv_code');
// }

module.exports = {
  getAllCTV,
  getCTVById,
  getCTVByCode,
  createCTV,
  updateCTV,
  softDeleteCTV,
  // generateUniqueCode,
};
