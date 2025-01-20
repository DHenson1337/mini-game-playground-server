import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

//CRUD Routes
router.post("/", createUser);
router.get("/:username", getUser);
router.put("/:username", updateUser);
router.delete("/:username", authenticate, deleteUser); //The Auth is so only users can delete themesleves

export default router;
