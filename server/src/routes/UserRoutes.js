import { Router } from "express";
import {
  getCurrentUser,
  login,
  loginAdmin,
  register,
} from "../controllers/UserController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", loginAdmin);
router.get("/me", protect, getCurrentUser);

export default router;
