const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user_controller");
// const { getAllUsers } = require("../../controllers/user_controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/createUser", userController.createUser);
router.put("/updateUser/:id", userController.updateUser);
// router.delete("/deleteUser/:id", userController.deleteUser);
router.patch("/:id/status", userController.updateUserStatus);


module.exports = router;
