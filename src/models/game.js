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
  engineType: {
    type: String,
    required: true,
    enum: ["js", "phaser", "custom", "iframe"],
    default: "js",
  },
  sourceUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "/assets/placeholders/game-thumbnail.png",
  },
  previewUrl: {
    type: String,
    default: "/assets/placeholders/game-preview.png",
  },
  category: {
    type: String,
    required: true,
    enum: ["arcade", "puzzle", "action", "strategy"],
    default: "arcade",
  },
  controls: [
    {
      key: String,
      action: String,
    },
  ],
  rules: [String],
  enabled: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Update lastUpdated timestamp on modification
gameSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
