import Game from "../models/game.js";

/**
 * Creates a new game in the database
 * @route POST /api/games
 * @param {Object} req.body - Game data including title, description, engineType, etc.
 * @returns {Object} Created game object
 * @throws {400} If validation fails or required fields are missing
 */
export const createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieves games with pagination and optional category filtering
 * @route GET /api/games
 * @param {string} req.query.category - Optional category filter
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 20)
 * @returns {Object} Paginated games with metadata
 * @throws {500} If server error occurs
 */
export const getGames = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { category, page = 1, limit = 20 } = req.query;
    const query = {};

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Fetch games with pagination
    const games = await Game.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 }) // Sort featured games first
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination metadata
    const total = await Game.countDocuments(query);

    // Return games with pagination metadata
    res.json({
      games,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalGames: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a specific game by its gameId
 * @route GET /api/games/:gameId
 * @param {string} req.params.gameId - Unique game identifier
 * @returns {Object} Game object if found
 * @throws {404} If game not found
 * @throws {500} If server error occurs
 */
export const getGame = async (req, res) => {
  try {
    console.log("Requested gameId:", req.params.gameId);
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      console.log("Game not found in database");
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    console.error("Error in getGame:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates an existing game
 * @route PUT /api/games/:gameId
 * @param {string} req.params.gameId - Unique game identifier
 * @param {Object} req.body - Updated game data
 * @returns {Object} Updated game object
 * @throws {404} If game not found
 * @throws {500} If server error occurs
 */
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

/**
 * Initializes the database with default games if empty
 * @route POST /api/games/initialize
 * @description Seeds the database with initial game data if no games exist
 * @returns {Object} Success message
 * @throws {500} If initialization fails
 */
export const initializeGames = async (req, res) => {
  try {
    console.log("Starting game initialization...");

    // First, clear existing games
    await Game.deleteMany({});
    console.log("Cleared existing games");

    const gamesData = [
      {
        gameId: "tetris-classic",
        title: "Tetris Classic",
        description: "The classic block-stacking puzzle game",
        engineType: "js",
        sourceUrl: "/games/tetris/index.js",
        category: "puzzle",
        controls: [
          { key: "←/→", action: "Move block" },
          { key: "↑", action: "Rotate" },
          { key: "↓", action: "Soft drop" },
          { key: "Space", action: "Hard drop" },
        ],
        featured: true,
        enabled: true,
        order: 1,
        thumbnailUrl: "/assets/placeholders/tetris-thumb.png",
        previewUrl: "/assets/placeholders/tetris-preview.png",
      },
      // Add more games here later
    ];

    console.log("Inserting games:", gamesData);
    const insertedGames = await Game.insertMany(gamesData);
    console.log("Games inserted successfully:", insertedGames);

    res.status(200).json({
      message: "Games initialized successfully",
      games: insertedGames,
    });
  } catch (error) {
    console.error("Error initializing games:", error);
    res.status(500).json({
      message: "Failed to initialize games",
      error: error.message,
    });
  }
};

/**
 * Retrieves games grouped by their categories
 * @route GET /api/games/categories
 * @description Gets all games organized by their categories
 * @returns {Object} Object with categories as keys and array of games as values
 * @throws {500} If server error occurs
 */
export const getGamesByCategory = async (req, res) => {
  try {
    // Get unique categories
    const categories = await Game.distinct("category");
    const gamesByCategory = {};

    // Fetch games for each category
    for (const category of categories) {
      gamesByCategory[category] = await Game.find({ category }).sort({
        featured: -1,
        order: 1,
      });
    }

    res.json(gamesByCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
