import express from "express";
import {
  createGame,
  getGames,
  getGame,
  updateGame,
  initializeGames,
  getGamesByCategory,
} from "../controllers/gameController.js";

const router = express.Router();

// Basic CRUD routes
router.post("/", createGame);
router.get("/", getGames);
router.get("/categories", getGamesByCategory);
router.get("/:gameId", getGame);
router.put("/:gameId", updateGame);

// Initialization route - POST to http://localhost:5000/api/games/initialize
router.post("/initialize", initializeGames);

export default router;
