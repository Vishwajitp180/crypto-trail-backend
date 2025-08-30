import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  date: Date,
  completed: { type: Boolean, default: false },
  userId: String,
});

export const Task = mongoose.model("Task", taskSchema);
