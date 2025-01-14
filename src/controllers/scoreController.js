import Score from "../models/score.js";
import User from "../models/user.js";

export const createScore = async (req, res) => {
  try {
    const { username, gameId, score } = req.body;

    // Find user to get their ID
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newScore = await Score.create({
      userId: user._id,
      gameId,
      score,
    });

    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Get route for the Leader board page
export const getGameLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const scores = await Score.find({ gameId })
      .sort({ score: -1 }) // Highest scores first
      .limit(100) // Limits how many scores show up
      .populate("userId", "username avatar"); // Get user details

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Gets user Scores by ID
export const getUserScores = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scores = await Score.find({ userId: user._id }).sort({
      timestamp: -1,
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
