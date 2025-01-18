import User from "../models/user.js";
import authService from "../services/authService.js";

/**
 * Create a new user
 * @route POST /api/users
 * @param {Object} req.body - User data including username and avatar
 * @returns {Object} Created user object
 * @throws {400} If validation fails or required fields are missing
 */
export const createUser = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.create({ username, avatar });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get user by username
 * @route GET /api/users/:username
 * @param {string} req.params.username - Username to look up
 * @returns {Object} User object if found
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/:username
 * @param {string} req.params.username - Username of user to update
 * @param {Object} req.body - Update data which may include:
 *   - newUsername: New username to set
 *   - newAvatar: New avatar to set
 *   - currentPassword: Current password (required for password change)
 *   - newPassword: New password to set
 * @returns {Object} Updated user object (password excluded)
 * @throws {404} If user not found
 * @throws {400} If validation fails or username taken
 * @throws {401} If current password is incorrect
 */
export const updateUser = async (req, res) => {
  try {
    const { newUsername, newAvatar, currentPassword, newPassword } = req.body;

    // Find user by current username
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle password change if requested
    if (newPassword) {
      // Require current password for security
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      // Verify current password is correct
      const isValidPassword = await authService.comparePasswords(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash and set new password
      user.password = await authService.hashPassword(newPassword);
    }

    // Handle username change if requested
    if (newUsername) {
      // Check if new username is already taken by another user
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = newUsername;
    }

    // Handle avatar change if requested
    if (newAvatar) {
      user.avatar = newAvatar;
    }

    // Save changes to database
    await user.save();

    // Remove password from response for security
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete user account
 * @route DELETE /api/users/:username
 * @param {string} req.params.username - Username of user to delete
 * @returns {Object} Success message
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
