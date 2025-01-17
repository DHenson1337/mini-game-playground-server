import authService from "../services/authService.js";
import User from "../models/user.js";

/**
 * Main authentication middleware
 * Verifies access token and handles token refresh
 */
export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Verify access token
      const decoded = authService.verifyAccessToken(accessToken);
      req.user = decoded;
      next();
    } catch (error) {
      // Access token is invalid/expired, try refresh token
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify refresh token
      const decoded = authService.verifyRefreshToken(refreshToken);

      // Get user from database to ensure they still exist
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate new access token
      const newAccessToken = authService.generateAccessToken(user);

      // Set new access token in cookie
      authService.setTokenCookies(res, newAccessToken, refreshToken);

      req.user = decoded;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Optional middleware to allow guest access
 * Use this for routes that can be accessed by both guests and registered users
 */
export const allowGuest = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    req.isGuest = true;
    next();
    return;
  }

  try {
    const decoded = authService.verifyAccessToken(accessToken);
    req.user = decoded;
    req.isGuest = decoded.isGuest;
    next();
  } catch (error) {
    req.isGuest = true;
    next();
  }
};

/**
 * Middleware to require full authentication
 * Use this for routes that should only be accessed by registered users
 */
export const requireAuth = (req, res, next) => {
  if (req.isGuest || !req.user) {
    return res.status(403).json({
      message: "This action requires a registered account",
    });
  }
  next();
};

/**
 * Optional middleware to validate ownership
 * Use this for routes that should only be accessed by the resource owner
 */
export const validateOwnership = (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({
      message: "Not authorized to access this resource",
    });
  }
  next();
};
