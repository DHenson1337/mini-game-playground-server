// middleware/scoreValidation.js

/**
 * Game-specific score validation rules
 */
const GAME_RULES = {
  "tetris-classic": {
    maxScore: 999999,
    minScore: 0,
    scoreMultiple: 1, // Tetris scores should be whole numbers
    maxLinesPerMinute: 100, // Maximum theoretical lines per minute
  },
};

/**
 * Validates score submissions
 * Checks for valid score values and required fields
 */
export const validateScore = (req, res, next) => {
  const { username, gameId, score } = req.body;

  // Check for required fields
  if (!username || !gameId || score === undefined) {
    return res.status(400).json({
      message: "Missing required fields",
      details: "Username, gameId, and score are required",
    });
  }

  // Validate score value
  if (typeof score !== "number" || isNaN(score)) {
    return res.status(400).json({
      message: "Invalid score format",
      details: "Score must be a number",
    });
  }

  // Get game-specific rules
  const gameRules = GAME_RULES[gameId] || {
    maxScore: 999999,
    minScore: 0,
    scoreMultiple: 1,
  };

  // Validate score range
  if (score < gameRules.minScore || score > gameRules.maxScore) {
    return res.status(400).json({
      message: "Invalid score value",
      details: `Score must be between ${gameRules.minScore} and ${gameRules.maxScore}`,
    });
  }

  // Validate score is a proper multiple (if required)
  if (score % gameRules.scoreMultiple !== 0) {
    return res.status(400).json({
      message: "Invalid score value",
      details: `Score must be a multiple of ${gameRules.scoreMultiple}`,
    });
  }

  // Validate gameId format
  if (typeof gameId !== "string" || !/^[a-z0-9-]+$/.test(gameId)) {
    return res.status(400).json({
      message: "Invalid gameId format",
      details:
        "GameId must contain only lowercase letters, numbers, and hyphens",
    });
  }

  // If all validations pass, proceed to next middleware
  next();
};

/**
 * Sanitizes score data before processing
 * Removes any unexpected fields and formats data
 */
export const sanitizeScore = (req, res, next) => {
  const { username, gameId, score } = req.body;

  // Clean and sanitize the data
  req.body = {
    username: username.trim().toLowerCase(), // Consistent username casing
    gameId: gameId.trim().toLowerCase(),
    score: Math.floor(score), // Ensure score is an integer
  };

  next();
};

/**
 * Rate limiting for score submissions per user
 * Prevents rapid-fire score submissions
 */
export const rateLimit = (options = {}) => {
  const scoreSubmissions = new Map();
  const { windowMs = 60000, max = 10 } = options;

  return (req, res, next) => {
    const username = req.body.username;
    if (!username) return next();

    const now = Date.now();
    const userSubmissions = scoreSubmissions.get(username) || [];

    // Clean up old submissions
    const recentSubmissions = userSubmissions.filter(
      (time) => now - time < windowMs
    );

    if (recentSubmissions.length >= max) {
      return res.status(429).json({
        message: "Too many score submissions",
        details: `Please wait before submitting more scores. Maximum ${max} submissions per ${
          windowMs / 1000
        } seconds.`,
      });
    }

    recentSubmissions.push(now);
    scoreSubmissions.set(username, recentSubmissions);
    next();
  };
};
