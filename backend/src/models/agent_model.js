const pool = require("../config/database_config");

const createAgent = async ({ user_id, agent_name, diachi, masothue }) => {
  const result = await db.query(
    `INSERT INTO member.agent (user_id, agent_name, diachi, masothue)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [user_id, agent_name, diachi, masothue]
  );
  return result.rows[0];
};

const getAgentById = async (agent_id) => {
  const res = await db.query(`SELECT * FROM member.agent WHERE agent_id = $1`, [agent_id]);
  return res.rows[0];
};

const updateAgent = async (agent_id, fields) => {
  const sets = [];
  const values = [];
  let idx = 1;
  for (const k of Object.keys(fields)) {
    sets.push(`${k} = $${idx++}`);
    values.push(fields[k]);
  }
  values.push(agent_id);
  const q = `UPDATE agent SET ${sets.join(', ')} WHERE member.agent_id = $${idx} RETURNING *`;
  const res = await db.query(q, values);
  return res.rows[0];
};

const deleteAgent = async (agent_id) => {
  await db.query(`DELETE FROM member.agent WHERE agent_id = $1`, [agent_id]);
  return true;
};

const listAgents = async ({ search, limit=50, offset=0 } = {}) => {
  let q = `SELECT * FROM member.agent`;
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    q += ` WHERE agent_name ILIKE $1 OR masothue ILIKE $1`;
  }
  q += ` ORDER BY agent_id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
  params.push(limit, offset);
  const res = await db.query(q, params);
  return res.rows;
};

module.exports = {
  createAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
  listAgents
};
