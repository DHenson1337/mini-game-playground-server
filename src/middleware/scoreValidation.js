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

  // Validate score range
  if (score < 0 || score > 999999) {
    return res.status(400).json({
      message: "Invalid score value",
      details: "Score must be between 0 and 999999",
    });
  }

  // Validate gameId format (assuming it's a string with specific format)
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
    username: username.trim().toLowerCase(),
    gameId: gameId.trim().toLowerCase(),
    score: Math.floor(score), // Ensure score is an integer
  };

  next();
};
