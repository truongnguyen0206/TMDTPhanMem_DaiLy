const {
    checkReferralExists,
    findReferral,
    createReferralRow,
    getRoleName,
  } = require("../models/product_model");
  
  const PREFIX = {
    3: "AGT", // Đại lý
    4: "CTV", // Cộng tác viên
    default: "REF"
  };
  
  function randomCode(prefix) {
    return `${prefix}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  
  // Tạo link giới thiệu theo product
  async function createReferralLink(owner_id, owner_role_id, product_id) {
    if (!owner_id || !owner_role_id || !product_id)
      throw new Error("owner_id, owner_role_id, product_id là bắt buộc");
  
    const prefix = PREFIX[owner_role_id] || PREFIX.default;
    let referral_code = randomCode(prefix);
  
    while (await checkReferralExists(referral_code)) {
      referral_code = randomCode(prefix);
    }
  
    const referral_url = `https://softshop.vn/product/${product_id}?ref=${referral_code}`;
  
    const row = await createReferralRow({
      referral_code,
      owner_id,
      owner_role_id,
      product_id,
      referral_url,
      status: true
    });
  
    return row;
  }
  
  // Lấy danh sách link của 1 sản phẩm
  async function listReferralByProduct(product_id) {
    return await getReferralByProduct(product_id);
  }
  
  // Tắt link (disable)
  async function disableReferral(referral_code) {
    const ref = await findReferral(referral_code);
    if (!ref) throw new Error("Không tìm thấy referral_code");
  
    const { error } = await supabase
      .from("orders.referral_links")
      .update({ status: false })
      .eq("referral_code", referral_code);
  
    if (error) throw error;
  
    return true;
  }
  
  module.exports = {
    createReferralLink,
    listReferralByProduct,
    disableReferral,
  };