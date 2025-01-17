// controllers/authController.js

import User from "../models/user.js";
import authService from "../services/authService.js";

/**
 * Generate a unique guest username
 */
async function generateGuestUsername() {
  const baseUsername = "guest";
  let counter = 1;
  let username;
  let exists = true;

  while (exists) {
    username = `${baseUsername}${counter}`;
    // Check if username exists
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    if (!user) {
      exists = false;
    } else {
      counter++;
    }
  }

  return username;
}

/**
 * Register a new user
 * @route POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { username, password, avatar, rememberMe } = req.body;

    // Check if username exists (case-insensitive)
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      avatar,
      isGuest: false,
    });

    await user.save();

    // Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = rememberMe
      ? authService.generateRefreshToken(user)
      : null;

    // Set cookies
    authService.setTokenCookies(res, accessToken, refreshToken);

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    // Find user (case-insensitive)
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!user || user.isGuest) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password
    const isValidPassword = await authService.comparePasswords(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = rememberMe
      ? authService.generateRefreshToken(user)
      : null;

    // Set cookies
    authService.setTokenCookies(res, accessToken, refreshToken);

    // Return user data
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Guest login
 * @route POST /api/auth/guest
 */
export const guestLogin = async (req, res) => {
  try {
    const { avatar } = req.body;

    // Generate unique guest username
    const username = await generateGuestUsername();

    // Create guest user
    const guestUser = new User({
      username,
      avatar: avatar || "cowled", // Default avatar if none provided
      isGuest: true,
    });

    await guestUser.save();

    // Generate access token only (no refresh token for guests)
    const accessToken = authService.generateAccessToken(guestUser);
    authService.setTokenCookies(res, accessToken);

    res.status(201).json({
      message: "Guest access granted",
      user: guestUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    authService.clearTokenCookies(res);
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = authService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = authService.generateAccessToken(user);
    authService.setTokenCookies(res, accessToken, refreshToken);

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
