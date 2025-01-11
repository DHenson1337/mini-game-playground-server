import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
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

//Pre-delte hook for cleaning up user data if needed later
userSchema.pre("deleteOne", { document: true }, async function (next) {
  //To do - - add score cleanup here when score model is created.
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
