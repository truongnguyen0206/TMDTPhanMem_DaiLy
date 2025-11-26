// src/services/user_service.js
const UserModel = require("../models/user_model");

const VALID_STATUSES = [
  "Đang hoạt động",
  "Đang chờ cấp tài khoản",
  "Ngừng hoạt động",
];

const updateUserStatus = async (user_id, status) => {
  try {
    // Kiểm tra status hợp lệ với CHECK CONSTRAINT
    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: `Trạng thái không hợp lệ. Chỉ được: ${VALID_STATUSES.join(", ")}`,
      };
    }

    const user = await UserModel.updateUserStatus(user_id, status);

    return {
      success: true,
      message: `Cập nhật trạng thái thành công`,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lỗi khi cập nhật trạng thái user",
      error: error.message,
    };
  }
};

module.exports = {
  updateUserStatus,
};
