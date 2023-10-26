import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import {
  verifyEmail,
  sendVerificationCode,
} from "../controllers/verification.controller.js";
import { authorizedAccess } from "../middlewares/authorization.js";
const router = Router();

router.post("/login", login);
router.post("/logout", authorizedAccess, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authorizedAccess, forgotPassword);
router.post("/verify-email", verifyEmail);
router.post("/send-verification-code", sendVerificationCode);

export default router;
