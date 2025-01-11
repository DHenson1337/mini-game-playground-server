import mongoose from "mongoose";
import Score from "./score.js"; //So I can tie the scores to a userId

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [12, "Username cannot exceed 12 character"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ],
  },
  avatar: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Custom method to check if username exists
userSchema.statics.usernameExists = async function (username) {
  const user = await this.findOne({ username });
  return user !== null;
};

// Middleware to handle unique username validation
userSchema.pre("save", async function (next) {
  if (this.isModified("username")) {
    const exists = await this.constructor.usernameExists(this.username);
    if (exists && this.isNew) {
      throw new Error("Username already exists");
    }
  }
  next();
});

//Cleanup for when a user goes Nuclear on thier account :(
userSchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    //Delete all scores associated with this user
    await Score.deleteMany({ userId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
