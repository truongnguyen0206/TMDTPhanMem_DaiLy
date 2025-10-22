const express = require("express");
const router = express.Router();
const agentController = require("../../controllers/agent_controller");

router.get("/getAllAgents", agentController.getAllAgents);
router.get("/getAgent/:agentId", agentController.getAgent);
router.get("/listAgents", agentController.listAgents);
router.post("/createAgent", agentController.createAgent);
router.put("/updateAgent/:agentId", agentController.updateAgent);
router.delete("/deleteAgent/:agentId", agentController.deleteAgent);
router.put("/updateManyAgents", agentController.updateManyAgents);

module.exports = router;
