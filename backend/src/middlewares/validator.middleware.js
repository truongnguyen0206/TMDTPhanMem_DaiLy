// Middleware validation cho các API endpoints

// Validate ID parameter
const validateId = (paramName) => {
    return (req, res, next) => {
      const id = req.params[paramName];
      
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `${paramName} phải là số nguyên dương`
        });
      }
      
      req.params[paramName] = parseInt(id);
      next();
    };
  };
  
  // Validate commission rule data
  const validateCommissionRule = (req, res, next) => {
    const {
      role_id,
      min_sales,
      max_sales,
      commission_rate,
      product_category,
      start_date,
      end_date,
      description
    } = req.body;
  
    const errors = [];
  
    // Validate role_id (required)
    if (!role_id || isNaN(role_id) || parseInt(role_id) <= 0) {
      errors.push('Vai trò là bắt buộc và phải là số nguyên dương');
    }
  
    // Validate commission_rate (required)
    if (!commission_rate || isNaN(commission_rate)) {
      errors.push('Tỷ lệ hoa hồng là bắt buộc và phải là số');
    } else if (parseFloat(commission_rate) < 0 || parseFloat(commission_rate) > 100) {
      errors.push('Tỷ lệ hoa hồng phải từ 0 đến 100');
    }
  
    // Validate min_sales (optional)
    if (min_sales !== undefined && min_sales !== null) {
      if (isNaN(min_sales) || parseFloat(min_sales) < 0) {
        errors.push('Doanh số tối thiểu phải là số không âm');
      }
    }
  
    // Validate max_sales (optional)
    if (max_sales !== undefined && max_sales !== null) {
      if (isNaN(max_sales) || parseFloat(max_sales) < 0) {
        errors.push('Doanh số tối đa phải là số không âm');
      }
    }
  
    // Validate min_sales vs max_sales
    if (min_sales !== undefined && max_sales !== undefined && 
        min_sales !== null && max_sales !== null) {
      if (parseFloat(min_sales) >= parseFloat(max_sales)) {
        errors.push('Doanh số tối thiểu phải nhỏ hơn doanh số tối đa');
      }
    }
  
    // Validate start_date (optional)
    if (start_date && isNaN(Date.parse(start_date))) {
      errors.push('Ngày bắt đầu không hợp lệ');
    }
  
    // Validate end_date (optional)
    if (end_date && isNaN(Date.parse(end_date))) {
      errors.push('Ngày kết thúc không hợp lệ');
    }
  
    // Validate start_date vs end_date
    if (start_date && end_date) {
      if (new Date(start_date) >= new Date(end_date)) {
        errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      }
    }
  
    // Validate description length
    if (description && description.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
  
    // Convert string numbers to proper types
    req.body.role_id = parseInt(role_id);
    req.body.commission_rate = parseFloat(commission_rate);
    req.body.min_sales = min_sales ? parseFloat(min_sales) : null;
    req.body.max_sales = max_sales ? parseFloat(max_sales) : null;
    req.body.start_date = start_date ? new Date(start_date) : null;
    req.body.end_date = end_date ? new Date(end_date) : null;
  
    next();
  };
  
  // Validate user data
  const validateUser = (req, res, next) => {
    const { username, email, password, role_id } = req.body;
    const errors = [];
  
    if (!username || username.trim().length < 3) {
      errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
  
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email không hợp lệ');
    }
  
    if (!password || password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
  
    if (!role_id || isNaN(role_id) || parseInt(role_id) <= 0) {
      errors.push('Vai trò là bắt buộc và phải là số nguyên dương');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
  
    next();
  };
  
  // Validate order data
  const validateOrder = (req, res, next) => {
    const { customer_name, customer_phone, product_id, quantity, unit_price } = req.body;
    const errors = [];
  
    if (!customer_name || customer_name.trim().length < 2) {
      errors.push('Tên khách hàng phải có ít nhất 2 ký tự');
    }
  
    if (!customer_phone || !/^[0-9+\-\s()]+$/.test(customer_phone)) {
      errors.push('Số điện thoại không hợp lệ');
    }
  
    if (!product_id || isNaN(product_id) || parseInt(product_id) <= 0) {
      errors.push('Sản phẩm là bắt buộc và phải là số nguyên dương');
    }
  
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      errors.push('Số lượng phải là số nguyên dương');
    }
  
    if (!unit_price || isNaN(unit_price) || parseFloat(unit_price) <= 0) {
      errors.push('Đơn giá phải là số dương');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
  
    next();
  };
  
  module.exports = {
    validateId,
    validateCommissionRule,
    validateUser,
    validateOrder
  };
  