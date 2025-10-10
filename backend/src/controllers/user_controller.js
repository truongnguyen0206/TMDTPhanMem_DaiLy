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


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM auth.users WHERE user_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
