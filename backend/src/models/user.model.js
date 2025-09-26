const pool = require("../config/db");

const findByEmailOrUsername = async (email, username) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 OR username = $2",
    [email, username]
  );
  return result.rows;
};

const createUser = async (data) => {

  const { id, ...userData } = data;
  const keys = Object.keys(data); // ['username', 'email', 'password', 'phone', 'role_id']
  const values = Object.values(data); // [username, email, hashedPassword, phone, roleId]

  const placeholders = keys.map((_, i) => `$${i + 1}`);

  const query = `
    INSERT INTO users (${keys.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
};

const getUsers = async () => {
  const result = await pool.query
  ("SELECT u.user_id, u.username, u.email, u.phone, u.created_at, r.role_name, r.role_id FROM users u JOIN roles r ON u.role_id = r.role_id ORDER BY u.created_at DESC");
  return result.rows;
};

const updateUser = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;

  const setQuery = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = Object.values(fields);
  values.push(id);

  const query = `
    UPDATE users 
    SET ${setQuery}
    WHERE user_id = $${values.length}
    RETURNING user_id, username, email, phone, role_id
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};
const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, email",
    [id]
  );
  return result.rows[0];
};

const updateUsername = async (id, username) => {
  const result = await pool.query(
    "UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *",
    [username, id]
  );
  return result.rows[0];
};

module.exports = {
  findByEmailOrUsername,
  createUser,
  findByUsername,
  getUsers,
  updateUser,
  deleteUser,
  updateUsername,
};
