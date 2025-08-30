const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: "" }
}, { timestamps: true });  // adds createdAt & updatedAt automatically

module.exports = mongoose.model("User", userSchema);
