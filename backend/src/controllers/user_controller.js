const supabase = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

// 🟢 Lấy toàn bộ users (join roles)
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_users_with_roles");

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users_view")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.json(data);
  } catch (err) {
    console.error("Error fetching user by id:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🟢 Tạo user mới
const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, role_id } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users_view")
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          phone,
          role_id: role_id || 2, // mặc định role 2
          status: "Đang chờ cấp tài khoản",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "User created successfully", user: data });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🟢 Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role_id, status } = req.body;

    const { data, error } = await supabase
      .from("users_view")
      .update({ username, email, phone, role_id, status })
      .eq("user_id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Không tìm thấy user" });

    res.status(200).json({ message: "Cập nhật user thành công", user: data });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🟢 Xóa user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa agent & ctv trước nếu có
    await supabase.from("member.agent").delete().eq("user_id", id);
    await supabase.from("member.ctv").delete().eq("user_id", id);

    // Xóa user chính
    const { data, error } = await supabase
      .from("users_view")
      .delete()
      .eq("user_id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully", user: data });
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
