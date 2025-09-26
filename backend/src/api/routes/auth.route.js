const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const userController = require("../../controllers/user.controller");

// test route
router.get("/", authController.healthCheck);

router.post("/register", authController.register);
router.post("/login", authController.login);

router.put("/users/:id", userController.updateUser);
module.exports = router;
