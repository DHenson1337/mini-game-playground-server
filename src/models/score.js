import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Score = mongoose.model("Score", scoreSchema);
export default Score;
