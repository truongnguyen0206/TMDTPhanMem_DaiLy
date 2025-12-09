/**
 * routes/collaborator_route.js
 *
 * Express router for CTV endpoints.
 */

const express = require('express');
const router = express.Router();
const collaboratorController = require('../../controllers/collaborator_controller');

// GET all (supports query params)
router.get('/getAllCTV', collaboratorController.getAllCTV);

// GET one
router.get('/getCTVById/:id', collaboratorController.getCTVById);

// CREATE
router.post('/createCTV', collaboratorController.createCTV);

// UPDATE
router.put('/updateCTV/:id', collaboratorController.updateCTV);

// DELETE (soft)
router.delete('/removeCTV/:id', collaboratorController.removeCTV);

router.get("/:id/orders", collaboratorController.getOrdersByCTV);

// router.get(
//     '/',
//     authenticateToken,
//     authorizeRoles('admin', 'npp', 'dl'),
//     getCollaborators,
//   );
  

module.exports = router;
