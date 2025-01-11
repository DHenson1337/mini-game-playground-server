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
  imageUrl: String,
  enabled: {
    type: Boolean,
    default: true,
  },
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
