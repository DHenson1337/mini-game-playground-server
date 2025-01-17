// services/authService.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

class AuthService {
  constructor() {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error("JWT secrets not found in environment variables");
      process.exit(1);
    }
  }

  /**
   * Generate access token for authenticated user
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
    );
  }

  /**
   * Generate refresh token for "remember me" functionality
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
    );
  }

  /**
   * Verify access token
   * @param {string} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Hash password for storage
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} Whether passwords match
   */
  async comparePasswords(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Set authentication cookies
   * @param {Object} res - Express response object
   * @param {string} accessToken - JWT access token
   * @param {string} refreshToken - JWT refresh token
   */
  setTokenCookies(res, accessToken, refreshToken = null) {
    // Set access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie if provided (remember me)
    if (refreshToken) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }

  /**
   * Clear authentication cookies
   * @param {Object} res - Express response object
   */
  clearTokenCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
}

// Export as singleton
export default new AuthService();
