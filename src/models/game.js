import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  rules: [
    {
      type: String,
    },
  ],
  enabled: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
