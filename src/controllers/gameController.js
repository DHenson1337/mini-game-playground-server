import Game from "../models/game.js";

//Responsible for creating new games on the list
export const createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Responsible for showing all the games
export const getGames = async (req, res) => {
  try {
    const games = await Game.find({ enabled: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Responsible for getting a game by ID
export const getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
