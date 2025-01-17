// routes/authRoutes.js

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  signup,
  login,
  logout,
  guestLogin,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/guest", guestLogin);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
