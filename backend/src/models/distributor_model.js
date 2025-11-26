const supabase = require("../config/supabaseClient");


// 🟢 Lấy toàn bộ danh sách nhà phân phối
const getAllNPP = async () => {
  const { data, error } = await supabase
    .from("nhaphanphoi_view")  // bảng trong schema member
    .select("*")
    .order("npp_id", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * ✔ Lấy danh sách đơn hàng thuộc nhà phân phối
 * @param {number} nppId - ID nhà phân phối
 */
const getOrdersByDistributor = async (nppId) => {
    const { data, error } = await supabase
      .from("npp_order_detail")
      .select("*")
      .eq("npp_id", nppId)
      .order("tao_vao_luc", { ascending: false });
  
    if (error) {
      console.error("Supabase error getOrdersByDistributor:", error);
      throw new Error("Database query failed");
    }
  
    return data;
  };



module.exports = { getOrdersByDistributor, getAllNPP };