const supabase = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

// 🟢 Lấy toàn bộ users (join roles)
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_users_with_roles");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi getAllUsers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.rpc("get_users_with_roles");
    if (error) throw error;
    const user = data.find(u => u.user_id == id); 
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại trong kết quả RPC" });
    }
    res.json(user);
  } catch (err) {
    console.error("Lỗi getUserById:", err);
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
          role_id: role_id || 2, 
          status: "Đang chờ cấp tài khoản",
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: "User created successfully", user: data });
  } catch (err) {
    console.error("Lỗi createUser:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ==========================================================
// 🟢 CẬP NHẬT USER (BẢN AN TOÀN - LOẠI BỎ AUTH)
// ==========================================================
const updateUser = async (req, res) => {
  try {
    // 'id' ở đây là user_id (SỐ NGUYÊN, vd: 37)
    const { id } = req.params; 
    
    // Chỉ lấy các trường công khai (public) từ body
    const { username, role_id, status, phone } = req.body;

    // Lỗi 500 xảy ra vì chúng ta cố cập nhật email/password (trường Auth).
    // GIẢI PHÁP: Chỉ cập nhật các trường public.
    const publicPayload = {
      username,
      role_id,
      status,
      phone // Cập nhật SĐT (trường này có trong public.users)
    };

    console.log(`[Public Update] Đang cập nhật Public cho user_id ${id}:`, publicPayload);
    const { data, error } = await supabase
      .from("users_view") // Hoặc "users"
      .update(publicPayload)
      .eq("user_id", id) // Dùng user_id (số nguyên)
      .select()
      .single();

    if (error) throw error; 
    if (!data) return res.status(404).json({ message: "Không tìm thấy user trong bảng public" });

    res.status(200).json({ message: "Cập nhật user thành công (trừ email/password)", user: data });
    
  } catch (error) {
    console.error("Lỗi updateUser:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🟢 Xóa user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from("member.agent").delete().eq("user_id", id);
    await supabase.from("member.ctv").delete().eq("user_id", id);
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
    console.error("Lỗi deleteUser:", err);
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