const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController.js");
const limiter = require("../../middlewere/limiter.js");
const { authenticate } = require("../../middlewere/authmiddlewere.js");

router.post("/login", limiter.loginlimiter, authController.loginController);
router.post(
  "/registration",
  limiter.registrationlimiter,
  authController.registrationController,
);
router.get("/verify-email/:token", authController.verifyEmailController);
router.post(
  "/resend-verification",
  authController.resendVerificationController,
);
router.post("/refresh-token", authController.refreshTokenController);
router.post("/logout", authenticate, authController.logoutController);
router.post("/forgot-password", authController.forgotPasswordController);
router.post("/reset-password/:token", authController.resetPasswordController);
router.get("/me", authenticate, authController.getMeController);
router.patch("/profile", authenticate, authController.updateProfile);

module.exports = router;
