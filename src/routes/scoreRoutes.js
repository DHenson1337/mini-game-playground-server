// backend/routes/scoreRoutes.js

import express from "express";
import {
  createScore,
  getGameLeaderboard,
  getUserScores,
} from "../controllers/scoreController.js";

const router = express.Router();

// Route for submitting a new score
router.post("/", createScore);

// Route for getting leaderboard for a specific game
router.get("/game/:gameId", getGameLeaderboard);

// Route for getting all scores for a specific user
router.get("/user/:username", getUserScores);

export default router;
