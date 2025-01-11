import express from "express";
import {
  createGame,
  getGames,
  getGame,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/", createGame);
router.get("/", getGames);
router.get("/:gameId", getGame);

export default router;
