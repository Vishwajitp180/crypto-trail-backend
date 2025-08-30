const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  crop: { type: String, required: true, trim: true },
  activity: { type: String, required: true, trim: true },
  date: { type: Date, required: true },            // Date type ensures reminders work
  notes: { type: String, default: "" },
  images: [{ type: String }],                      // store filenames or URLs
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });                          // createdAt & updatedAt automatically added

module.exports = mongoose.model("Log", logSchema);
