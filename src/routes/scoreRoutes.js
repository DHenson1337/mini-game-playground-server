// routes/scoreRoutes.js
import express from "express";
import {
  createScore,
  getGameLeaderboard,
  getUserScores,
} from "../controllers/scoreController.js";
import { validateScore, sanitizeScore } from "../middleware/scoreValidation.js"; // Fixed import path

const createRouter = (socketService) => {
  const router = express.Router();

  // Attach socketService to the request
  const attachSocketService = (req, res, next) => {
    req.socketService = socketService;
    next();
  };

  // Route for submitting a new score
  router.post(
    "/",
    validateScore,
    sanitizeScore,
    attachSocketService,
    createScore
  );

  // Route for getting leaderboard for a specific game
  router.get("/game/:gameId", getGameLeaderboard);

  // Route for getting all scores for a specific user
  router.get("/user/:username", getUserScores);

  return router;
};

export default createRouter;
