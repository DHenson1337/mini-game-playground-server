import Score from "../models/score.js";
import User from "../models/user.js";

export const createScore = async (req, res) => {
  try {
    const { username, gameId, score } = req.body;
    console.log("Creating score:", { username, gameId, score });

    if (!username || !gameId || score === undefined) {
      console.log("Missing required fields:", { username, gameId, score });
      return res.status(400).json({
        message: "Missing required fields",
        details: { username, gameId, score },
      });
    }

    // Case-insensitive username lookup
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!user) {
      console.log("User not found for username:", username);
      return res.status(404).json({
        message: "User not found",
        details: { username },
      });
    }

    const newScore = await Score.create({
      userId: user._id,
      gameId,
      score,
    });

    // Populate user data for the response
    const populatedScore = await Score.findById(newScore._id).populate(
      "userId",
      "username avatar"
    );

    // Emit the new score via Socket.IO if available
    if (req.socketService) {
      req.socketService.broadcastScore(gameId, {
        score: populatedScore,
        username: username,
        gameId: gameId,
      });
    }

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
