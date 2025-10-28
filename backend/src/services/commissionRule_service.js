// Service không còn "biết" về Supabase, nó chỉ biết về Model.
const CommissionRuleModel = require('../models/commissionRule_model');

// Trách nhiệm: Chứa logic nghiệp vụ.
// Trong trường hợp CRUD đơn giản, nó có thể chỉ gọi thẳng Model.
// Nhưng nếu có nghiệp vụ phức tạp, nó sẽ được xử lý ở đây.

const getAll = async () => {
    // Ví dụ về logic nghiệp vụ có thể thêm vào:
    // const { data, error } = await CommissionRuleModel.findAll();
    // if (data) {
    //   data.forEach(rule => rule.is_active = new Date() < new Date(rule.end_date));
    // }
    // return { data, error };
    return CommissionRuleModel.findAll();
};

const getById = async (ruleId) => {
    return CommissionRuleModel.findById(ruleId);
};

const create = async (ruleData) => {
    // Ví dụ về business logic: Kiểm tra dữ liệu trước khi tạo
    if (ruleData.min_sales >= ruleData.max_sales) {
        // Ném ra một lỗi nghiệp vụ để controller bắt
        throw new Error("Minimum sales cannot be greater than or equal to maximum sales.");
    }
    return CommissionRuleModel.create(ruleData);
};

const update = async (ruleId, ruleData) => {
    return CommissionRuleModel.update(ruleId, ruleData);
};

const remove = async (ruleId) => {
    return CommissionRuleModel.remove(ruleId);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};