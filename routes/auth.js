const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();

//register user
router.post("/register", authController.registerUser);

//login user
router.post("/login", authController.loginUser);

router.post("/login_admin", authController.loginAdmin);

// Request refresh token
router.post("/refresh", authController.requestRefreshToken);

// Logout user
router.post("/logout", authController.logoutUser);

module.exports = router;