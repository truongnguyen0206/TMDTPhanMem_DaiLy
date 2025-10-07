const supabase = require('../config/db.config');

const findById = async (id) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

const updateActivities = async (id, activities) => {
    const { error } = await supabase.from('users').update({ activities }).eq('id', id);
    if (error) throw error;
};

module.exports = {
    // Các method khác...
    findById,
    updateActivities
};