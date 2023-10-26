import { Router } from "express";
import {
  register,
  changePassword,
  updateUser,
  getUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authorizedAccess } from "../middlewares/authorization.js";
import { imageUpload } from "../middlewares/multer.js";
const router = Router();

router.post("/", register);
router.post("/change-password", authorizedAccess, changePassword);
router.patch("/", authorizedAccess, imageUpload, updateUser);
router.get("/", authorizedAccess, getUser);
router.delete("/", authorizedAccess, deleteUser);

export default router;
