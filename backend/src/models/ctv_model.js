const pool = require("../config/database_config");

const createCTV = async ({ user_id, ctv_name, diachi, agent_id }) => {
  const res = await db.query(
    `INSERT INTO member.ctv (user_id, ctv_name, diachi, agent_id) VALUES ($1,$2,$3,$4) RETURNING *`,
    [user_id, ctv_name, diachi, agent_id]
  );
  return res.rows[0];
};

const assignCTVToAgent = async (ctv_id, agent_id) => {
  const res = await db.query(`UPDATE member.ctv SET agent_id = $1 WHERE ctv_id = $2 RETURNING *`, [agent_id, ctv_id]);
  return res.rows[0];
};

const listCTVByAgent = async (agent_id) => {
  const res = await db.query(`SELECT * FROM member.ctv WHERE agent_id = $1`, [agent_id]);
  return res.rows;
};

module.exports = { createCTV, assignCTVToAgent, listCTVByAgent };
