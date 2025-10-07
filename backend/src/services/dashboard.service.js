const supabase = require('../config/db.config');
const xlsx = require('xlsx');
const fs = require('fs');

const getPersonalData = async (userId) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('username, role, sales, activities')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return user;
};

const processExcelUpload = async (filePath, userId) => {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Xử lý dữ liệu ví dụ: map thành activities
    const activities = data.map(row => row.Activity || 'Unknown activity');

    const { error } = await supabase
        .from('users')
        .update({ activities })
        .eq('id', userId);

    if (error) throw error;

    // Xóa file tạm sau xử lý
    fs.unlinkSync(filePath);
};

module.exports = {
    getPersonalData,
    processExcelUpload
};

const UserModel = require('../models/user_model');

// Trong getPersonalData:
const user = await UserModel.findById(userId);
return {
    username: user.username,
    role: user.role,
    sales: user.sales,
    activities: user.activities
};

// Trong processExcelUpload:
await UserModel.updateActivities(userId, activities);