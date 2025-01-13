import express from "express";
import {
  createGame,
  getGames,
  getGame,
  updateGame,
  initializeGames,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/", createGame);
router.get("/", getGames);
router.get("/:gameId", getGame);
router.put("/:gameId", updateGame);

// http://localhost:5000/api/games/initialize (For Seeding new games)
router.post("/initialize", initializeGames);

export default router;
