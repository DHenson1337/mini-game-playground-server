// backend/controllers/scoreController.js

import Score from "../models/score.js";
import User from "../models/user.js";

export const createScore = async (req, res) => {
  try {
    const { username, gameId, score } = req.body;
    console.log("Creating score:", { username, gameId, score });

    // Validate input
    if (!username || !gameId || score === undefined) {
      console.log("Missing required fields:", { username, gameId, score });
      return res.status(400).json({
        message: "Missing required fields",
        details: { username, gameId, score },
      });
    }

    // Find user
    const user = await User.findOne({ username });
    console.log("User lookup result:", user ? "Found" : "Not found", {
      username,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        details: { username },
      });
    }

    // Create score
    const newScore = await Score.create({
      userId: user._id,
      gameId,
      score,
    });

    console.log("Created score:", newScore);

    // Return populated score
    const populatedScore = await Score.findById(newScore._id).populate(
      "userId",
      "username avatar"
    );

    res.status(201).json(populatedScore);
  } catch (error) {
    console.error("Score creation error:", error);
    res.status(500).json({
      message: "Error creating score",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getGameLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    console.log("Fetching leaderboard for game:", gameId);

    const scores = await Score.find({ gameId })
      .sort({ score: -1 })
      .limit(100)
      .populate("userId", "username avatar");

    // Filter out scores with deleted users
    const validScores = scores.filter((score) => score.userId != null);
    console.log(`Found ${validScores.length} valid scores`);

    res.json(validScores);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
};

export const getUserScores = async (req, res) => {
  try {
    const { username } = req.params;
    console.log("Fetching scores for user:", username);

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({
        message: "User not found",
      });
    }

    const scores = await Score.find({ userId: user._id }).sort({
      timestamp: -1,
    });

    console.log(`Found ${scores.length} scores for user`);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching user scores:", error);
    res.status(500).json({
      message: "Failed to fetch user scores",
      error: error.message,
    });
  }
};

// Export all functions
export default {
  createScore,
  getGameLeaderboard,
  getUserScores,
};
