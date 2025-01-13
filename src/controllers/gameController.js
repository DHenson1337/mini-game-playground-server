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
    const games = await Game.find().sort("order"); // Sort by order field
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

//Update an existing game
export const updateGame = async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { gameId: req.params.gameId },
      req.body,
      { new: true }
    );
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Seeding new Games
// server/src/controllers/gameController.js
export const initializeGames = async (req, res) => {
  try {
    const existingGames = await Game.find();
    if (existingGames.length === 0) {
      const gamesData = [
        {
          gameId: "apple-catcher",
          title: "Apple Catcher",
          description:
            "Catch falling apples while avoiding the rotten ones in this fast-paced arcade game!",
          rules: [
            "🍏 You have 45 seconds to catch the Apples!",
            "🎮 Use WASD or Arrow Keys to move",
            "🎯 Catch more than 30 apples to win",
            "⚠️ Watch out for rotten apples!",
            "⭐ Golden apples give bonus points",
          ],
          enabled: true,
          order: 1,
        },
        // Add placeholder games
        ...Array(6)
          .fill(null)
          .map((_, index) => ({
            gameId: `coming-soon-${index + 1}`,
            title: "Coming Soon",
            description: "New game under development",
            rules: [],
            enabled: false,
            order: index + 2,
          })),
      ];
      await Game.insertMany(gamesData);
    }
    res.status(200).json({ message: "Games initialized successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
