import { Router } from "express";
import {
  register,
  changePassword,
  updateUser,
  getUser,
  deleteUser,
} from "../controllers/user.controller.js";
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
import { imageUpload } from "../middlewares/index.js";
const router = Router();
// AUTH
router.post("/", register);
router.post("/login", login);
router.post("/logout", authorizedAccess, logout);
router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authorizedAccess, forgotPassword);
router.post("/send-verification-code", sendVerificationCode);

// EDIT
router.post("/change-password", authorizedAccess, changePassword);
router.post("/edit-user", authorizedAccess, imageUpload, updateUser);

// Get Data
router.get("/", authorizedAccess, getUser);
router.delete("/", authorizedAccess, deleteUser);

export default router;
