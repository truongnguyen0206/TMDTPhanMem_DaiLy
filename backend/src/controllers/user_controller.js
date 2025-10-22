const userModel = require("../models/user_model");
const pool = require("../config/database_config");
const bcrypt = require("bcrypt");


const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM auth.users WHERE user_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user by id:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, role_id } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.createUser({
      username,
      email,
      password: hashedPassword,
      phone,
      role_id: role_id || 2
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role_id } = req.body;

    if (!username || !email || !role_id) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    const updatedUser = await userModel.updateUser(id, { username, email, phone, role_id });

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật" });
    }

    res.status(200).json({
      message: "Cập nhật user thành công",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       "DELETE FROM auth.users WHERE user_id = $1 RETURNING *",
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully", user: result.rows[0] });
//   } catch (err) {
//     console.error("Error deleting user:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect(); // Lấy một client từ pool để thực hiện transaction

  try {
      await client.query('BEGIN'); // Bắt đầu transaction

      // === BƯỚC 1: Xóa các bản ghi phụ thuộc trước ===
      // Xóa khỏi bảng agent (nếu có)
      await client.query('DELETE FROM "member"."agent" WHERE user_id = $1', [id]);
      
      // Xóa khỏi bảng ctv (nếu có)
      await client.query('DELETE FROM "member"."ctv" WHERE user_id = $1', [id]);
      // (Thêm các lệnh xóa ở các bảng khác nếu user_id cũng là khóa ngoại ở đó)

        // === BƯỚC 2: Xóa người dùng chính trong bảng auth.users ===
        const result = await client.query(
          'DELETE FROM auth.users WHERE user_id = $1 RETURNING *',
          [id]
      );

      if (result.rows.length === 0) {
          // Nếu không tìm thấy user, hủy bỏ transaction và báo lỗi
          await client.query('ROLLBACK');
          return res.status(404).json({ message: "User not found" });
      }

      await client.query('COMMIT'); // Hoàn tất transaction nếu mọi thứ thành công
      res.json({ message: "User deleted successfully", user: result.rows[0] });

  } catch (err) {
      await client.query('ROLLBACK'); // Hoàn tác tất cả thay đổi nếu có lỗi
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Server error", error: err.message });
  } finally {
      client.release(); // Trả client về lại pool
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
