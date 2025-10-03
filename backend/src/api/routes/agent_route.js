const express = require('express');
const router = express.Router();
const agentcontroller = require('../../controllers/agent_controller');

router.post('/', agentcontroller.createAgent);
router.get('/', agentcontroller.listAgents);
router.get('/:agentId', agentcontroller.getAgent);
router.put('/:agentId', agentcontroller.updateAgent);
router.delete('/:agentId', agentcontroller.deleteAgent);

module.exports = router;
