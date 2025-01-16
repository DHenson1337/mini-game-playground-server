import express from "express";
import {
  createGame,
  getGames,
  getGame,
  updateGame,
  initializeGames,
} from "../controllers/gameController.js";

const router = express.Router();

// Initialize endpoint - this MUST come before the /:gameId route

//http://localhost:5000/api/games/init
router.get("/init", initializeGames); // Changed to GET and simplified path
router.post("/init", initializeGames); // Also allow POST for the same endpoint

// Basic CRUD routes
router.post("/", createGame);
router.get("/", getGames);

// This must come after other specific routes
router.get("/:gameId", getGame);
router.put("/:gameId", updateGame);

export default router;
