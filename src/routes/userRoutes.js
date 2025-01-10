import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

//CRUD Routes
router.post("/", createUser);
router.get("/:username", getUser);
router.put("/:username", updateUser);
router.delete("/:username", deleteUser);

export default router;
