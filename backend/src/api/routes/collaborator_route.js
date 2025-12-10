/**
 * routes/collaborator_route.js
 *
 * Express router for CTV endpoints.
 */

const express = require('express');
const router = express.Router();
const collaboratorController = require('../../controllers/collaborator_controller');
const { authenticateToken } = require('../../middlewares/auth_middleware');

// GET all (supports query params)
router.get('/getAllCTV', authenticateToken, collaboratorController.getAllCTV);

// GET one
router.get('/getCTVById/:id', authenticateToken, collaboratorController.getCTVById);

// CREATE
router.post('/createCTV', authenticateToken, collaboratorController.createCTV);

// UPDATE
router.put('/updateCTV/:id', authenticateToken, collaboratorController.updateCTV);

// DELETE (soft)
router.delete('/removeCTV/:id', authenticateToken, collaboratorController.removeCTV);

router.get("/:id/orders", authenticateToken, collaboratorController.getOrdersByCTV);

// router.get(
//     '/',
//     authenticateToken,
//     authorizeRoles('admin', 'npp', 'dl'),
//     getCollaborators,
//   );
  

module.exports = router;
