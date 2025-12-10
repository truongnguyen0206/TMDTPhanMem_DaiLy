const express = require("express");
const router = express.Router();
const agentController = require("../../controllers/agent_controller");
const { getCTVListByAgent } = require("../../controllers/agent_controller");
const { authenticateToken } = require("../../middlewares/auth_middleware");
const { authorizeRoles } = require('../../middlewares/authorize_middleware');


router.get("/getAllAgents", authenticateToken, agentController.getAllAgents);  
router.get("/getAgent/:agentId", authenticateToken, agentController.getAgent);
router.get("/listAgents", authenticateToken, agentController.listAgents);
router.post("/createAgent", authenticateToken, agentController.createAgent);
router.put("/updateAgent/:agentId", authenticateToken, agentController.updateAgent);
router.delete("/deleteAgent/:agentId", authenticateToken, agentController.deleteAgent);
router.put("/updateManyAgents", authenticateToken, agentController.updateManyAgents);
router.get("/getctv/:agentId", authenticateToken, agentController.getCTVListByAgent);
router.get("/:id/orders", authenticateToken, agentController.getOrdersByAgent);
router.get("/:id/ctv-orders", authenticateToken, agentController.getOrdersOfCTVByAgent);
router.get("/:agent_id/products", authenticateToken, agentController.getProductsOfAgent);

// // 🔐 Chỉ admin và nhà phân phối được truy cập danh sách đại lý
// router.get('/', authenticateToken, authorizeRoles('admin', 'npp'), getAgents);
// router.post('/', authenticateToken, authorizeRoles('admin', 'npp'), postAgent);


module.exports = router;


// 'use strict';

// const express = require('express');
// const router = express.Router();
// const agentController = require('../../controllers/agent_controller');
// const { authenticateToken } = require('../../middlewares/auth_middleware');
// const { authorizeRoles } = require('../../middlewares/authorize_middleware');

// // 🟩 Các route cơ bản
// router.get('/getAllAgents', authenticateToken, authorizeRoles('admin', 'npp'), agentController.getAllAgents);
// router.get('/getAgent/:agentId', authenticateToken, authorizeRoles('admin', 'npp', 'dl'), agentController.getAgent);
// router.get('/listAgents', authenticateToken, authorizeRoles('admin', 'npp'), agentController.listAgents);
// router.post('/createAgent', authenticateToken, authorizeRoles('admin', 'npp'), agentController.createAgent);
// router.put('/updateAgent/:agentId', authenticateToken, authorizeRoles('admin', 'npp'), agentController.updateAgent);
// router.delete('/deleteAgent/:agentId', authenticateToken, authorizeRoles('admin', 'npp'), agentController.deleteAgent);
// router.put('/updateManyAgents', authenticateToken, authorizeRoles('admin'), agentController.updateManyAgents);
// router.get('/getctv/:agentId', authenticateToken, authorizeRoles('admin', 'npp', 'dl'), agentController.getCTVListByAgent);

// module.exports = router;
