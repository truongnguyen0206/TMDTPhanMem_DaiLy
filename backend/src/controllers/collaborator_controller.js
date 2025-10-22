/**
 * controllers/collaborator_controller.js
 *
 * Business logic / request handlers for CTV endpoints.
 */

const Collaborator = require('../models/collaborator_model');

/**
 * GET /api/ctv
 * Query params: agentId, search, page, limit, includeInactive
 */
async function getAllCTV(req, res) {
  try {
    const { agentId, search, page, limit, includeInactive } = req.query;
    const opts = {
      agentId: agentId ? Number(agentId) : null,
      search: search || '',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      includeInactive: includeInactive === 'true',
    };

    const rows = await Collaborator.getAllCTV(opts);
    return res.json({ data: rows });
  } catch (err) {
    console.error('getAll CTV error:', err);
    return res.status(500).json({
      message: 'Lỗi server khi lấy danh sách CTV.',
      error: err.message,
    });
  }
}

/** GET /api/ctv/:id */
async function getCTVById(req, res) {
  try {
    const ctvId = Number(req.params.id);
    if (!ctvId) {
      return res.status(400).json({ message: 'ctv_id không hợp lệ.' });
    }
    const row = await Collaborator.getCTVById(ctvId);
    if (!row) {
      return res.status(404).json({ message: 'Không tìm thấy CTV.' });
    }
    return res.json({ data: row });
  } catch (err) {
    console.error('getById CTV error:', err);
    return res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
}

/** POST /api/ctv */
async function createCTV(req, res) {
    try {
      const {
        user_id,
        ctv_name,
        diachi,
        ngaythamgia,
        agent_id,
      } = req.body;
  
      if (!ctv_name) {
        return res.status(400).json({ message: 'ctv_name is required.' });
      }
  
      const payload = {
        user_id: user_id ? Number(user_id) : null,
        ctv_name,
        diachi,
        ngaythamgia,
        agent_id: agent_id ? Number(agent_id) : null,
      };
  
      const created = await Collaborator.createCTV(payload);
      return res.status(201).json({ message: 'Tạo CTV thành công.', data: created });
    } catch (err) {
      console.error('create CTV error:', err);
      return res.status(500).json({ message: 'Lỗi server khi tạo CTV.', error: err.message });
    }
  }
  

/** PUT /api/ctv/:id */
async function updateCTV(req, res) {
  try {
    const ctvId = Number(req.params.id);
    if (!ctvId) {
      return res.status(400).json({ message: 'ctv_id không hợp lệ.' });
    }

    const {
      user_id,
      ctv_code,
      ctv_name,
      diachi,
      ngaythamgia,
      agent_id,
    } = req.body;

    // if updating code, ensure uniqueness
    if (ctv_code) {
      const existing = await Collaborator.getCTVByCode(ctv_code);
      if (existing && Number(existing.ctv_id) !== ctvId) {
        return res.status(409).json({ message: 'ctv_code đã có người dùng.' });
      }
    }

    const payload = {};
    if (typeof user_id !== 'undefined') payload.user_id = Number(user_id);
    if (typeof ctv_code !== 'undefined') payload.ctv_code = ctv_code;
    if (typeof ctv_name !== 'undefined') payload.ctv_name = ctv_name;
    if (typeof diachi !== 'undefined') payload.diachi = diachi;
    if (typeof ngaythamgia !== 'undefined') payload.ngaythamgia = ngaythamgia;
    if (typeof agent_id !== 'undefined') payload.agent_id = Number(agent_id);

    const updated = await Collaborator.update(ctvId, payload);
    if (!updated) {
      return res.status(404).json({ message: 'CTV không tồn tại hoặc không thể cập nhật.' });
    }

    return res.json({ message: 'Cập nhật thành công.', data: updated });
  } catch (err) {
    console.error('update CTV error:', err);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật CTV.', error: err.message });
  }
}

/** DELETE /api/ctv/:id (soft delete) */
async function removeCTV(req, res) {
  try {
    const ctvId = Number(req.params.id);
    if (!ctvId) {
      return res.status(400).json({ message: 'ctv_id không hợp lệ.' });
    }

    const ok = await Collaborator.softDeleteCTV(ctvId);
    if (!ok) {
      return res.status(404).json({ message: 'CTV không tồn tại.' });
    }

    return res.json({ message: 'Đã xóa (ẩn) CTV thành công.' });
  } catch (err) {
    console.error('delete CTV error:', err);
    return res.status(500).json({ message: 'Lỗi server khi xóa CTV.', error: err.message });
  }
}

module.exports = {
  getAllCTV,
  getCTVById,
  createCTV,
  updateCTV,
  removeCTV,
};
