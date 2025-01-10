import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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

//Pre-delte hook for cleaning up user data if needed later
userSchema.pre("delete", { document: true }, async function (next) {
  //To do - - add score cleanup here when score model is created.
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
