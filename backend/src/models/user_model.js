// // const pool = require("../config/database_config");
// const pool = require("../config/supabaseClient");

// const findByEmailOrUsername = async (email, username) => {
//   const result = await pool.query(
//     "SELECT * FROM users_view WHERE email = $1 OR username = $2",
//     [email, username]
//   );
//   return result.rows;
// };

// const createUser = async (data) => {

//   const { id, ...userData } = data;
//   const keys = Object.keys(data); // ['username', 'email', 'password', 'phone', 'role_id']
//   const values = Object.values(data); // [username, email, hashedPassword, phone, roleId]

//   const placeholders = keys.map((_, i) => `$${i + 1}`);

//   const query = `
//     INSERT INTO users_view (${keys.join(", ")})
//     VALUES (${placeholders.join(", ")})
//     RETURNING *;
//   `;

//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// const findByUsername = async (username) => {
//   const result = await pool.query("SELECT * FROM users_view WHERE username = $1", [
//     username,
//   ]);
//   return result.rows[0];
// };

// const getUsers = async () => {
//   const result = await pool.query
//   ("SELECT u.user_id, u.username, u.email, u.phone, u.created_at, r.role_name, r.role_id FROM users_view u JOIN auth.roles r ON u.role_id = r.role_id ORDER BY u.created_at DESC");
//   return result.rows;
// };

// const updateUser = async (id, fields) => {
//   const keys = Object.keys(fields);
//   if (keys.length === 0) return null;

//   const setQuery = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
//   const values = Object.values(fields);
//   values.push(id);

//   const query = `
//     UPDATE users_view 
//     SET ${setQuery}
//     WHERE user_id = $${values.length}
//     RETURNING user_id, username, email, phone, role_id
//   `;

//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// const deleteUser = async (id) => {
//   const result = await pool.query(
//     "DELETE FROM users_view WHERE user_id = $1 RETURNING user_id, username, email",
//     [id]
//   );
//   return result.rows[0];
// };

// const updateUsername = async (id, username) => {
//   const result = await pool.query(
//     "UPDATE users_view SET username = $1 WHERE user_id = $2 RETURNING *",
//     [username, id]
//   );
//   return result.rows[0];
// };

// module.exports = {
//   findByEmailOrUsername,
//   createUser,
//   findByUsername,
//   getUsers,
//   updateUser,
//   deleteUser,
//   updateUsername,
// };
const supabase = require("../config/supabaseClient");

// 🔍 Tìm user theo email hoặc username
const findByEmailOrUsername = async (email, username) => {
  const { data, error } = await supabase
    .from("users_view")
    .select("*")
    .or(`email.eq.${email},username.eq.${username}`);

  if (error) throw error;
  return data;
};

// ➕ Tạo user mới
const createUser = async (data) => {
  const { data: newUser, error } = await supabase
    .from("users_view")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("❌ Lỗi tạo user:", error);
    throw error;
  }

  return newUser;
};


// 🔍 Tìm user theo username
const findByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users_view")
    .select("*")
    .eq("username", username)
    .single();

  if (error) throw error;
  return data;
};

// 📋 Lấy toàn bộ users + role name
const getUsers = async () => {
  const { data, error } = await supabase
    .rpc("get_users_with_roles"); // 👈 Tạo 1 hàm SQL (RPC) trong Supabase để join roles

  if (error) throw error;
  return data;
};

// ✏️ Cập nhật user
const updateUser = async (id, fields) => {
  const { data, error } = await supabase
    .from("users_view")
    .update(fields)
    .eq("user_id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ❌ Xóa user
const deleteUser = async (id) => {
  const { data, error } = await supabase
    .from("users_view")
    .delete()
    .eq("user_id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ✏️ Cập nhật username
const updateUsername = async (id, username) => {
  const { data, error } = await supabase
    .from("users_view")
    .update({ username })
    .eq("user_id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
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
