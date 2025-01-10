import express from "express";
import {
  createScore,
  getGameLeaderboard,
  getUserScores,
} from "../controllers/scoreController.js";

const router = express.Router();

// Submit a new score
router.post("/", createScore);

// Get leaderboard for a specific game
router.get("/game/:gameId", getGameLeaderboard);

// Get all scores for a specific user
router.get("/user/:username", getUserScores);

export default router;
