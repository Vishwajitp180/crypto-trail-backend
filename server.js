import dotenv from "dotenv";
dotenv.config();
import activityRoutes from "./routes/activityRoutes.js";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import { body, validationResult } from "express-validator";
import User from "./models/User.js";
import Log from "./models/Log.js";
import { sendEmail } from "./emailservice.js";
import { fetchAgroData} from "./agroService.js";
// Node.js ESM fix for __dirname
import { Task } from "./models/task.model.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agri-diary";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use(session({
  secret: process.env.SESSION_SECRET || "my-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// Load logged-in user
app.use(async (req, res, next) => {
  if (req.session?.user) {
    try {
      req.user = await User.findById(req.session.user.id).select("-password").lean();
    } catch (e) {}
  }
  next();
});

function requireLogin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  next();
}

// HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/add-log", (req, res) => res.sendFile(path.join(__dirname, "public", "add-log.html")));

// Check auth
app.get("/api/check-auth", (req, res) => {
  res.json({ loggedIn: !!req.user, user: req.user || null });
});

// Auth routes
app.post("/api/signup",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "User already exists" });
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashed });
      await user.save();
      req.session.user = { id: user._id, email: user.email };
      res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
  }
);

app.post("/api/login",
  body("email").isEmail(),
  body("password").exists(),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });
      if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ success: false, message: "Invalid email or password" });
      req.session.user = { id: user._id, email: user.email };
      res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
  }
);

app.post("/api/logout", (req, res) => { req.session.destroy(() => res.json({ success: true })); });

// Logs
app.post("/api/logs", requireLogin,
  body("crop").isString().notEmpty(),
  body("activity").isString().notEmpty(),
  body("date").isISO8601(),
  async (req, res) => {
    const { crop, activity, date, notes } = req.body;
    try {
      const newLog = new Log({ crop, activity, date: new Date(date), notes: notes || "", user: req.user._id });
      await newLog.save();
      res.json({ success: true, log: newLog });
    } catch (err) { console.error(err); res.status(500).json({ error: "Failed to add log" }); }
  }
);

app.get("/api/logs", requireLogin, async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user._id }).sort({ date: -1 }).lean();
    res.json({ logs });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to fetch logs" }); }
});

// Delete single log
app.delete("/api/logs/:id", requireLogin, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (String(log.user) !== String(req.user._id)) return res.status(403).json({ error: "Forbidden" });
    await log.deleteOne();
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to delete log" }); }
});

// Delete all logs
app.delete("/api/logs", requireLogin, async (req, res) => {
  try {
    await Log.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to delete logs" }); }
});

import cron from "node-cron";

 // your email function

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running daily reminder check...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const start = new Date(tomorrow.setHours(0,0,0,0));
  const end = new Date(tomorrow.setHours(23,59,59,999));

  const logs = await Log.find({ date: { $gte: start, $lte: end } }).populate("user");

  for (let log of logs) {
    if (log.user?.email) {
      await sendEmail(
        log.user.email,
        "🌱 Farming Task Reminder",
        `Reminder: You have "${log.activity}" for crop "${log.crop}" scheduled on ${log.date.toDateString()}`
      );
      console.log(`📧 Reminder sent to ${log.user.email}`);
    }
  }
});
app.get("/agro-data", async (req, res) => {
  const data = await fetchAgroData();
  res.json(data);
});
// Add new task
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Mark task as completed
app.put("/tasks/:id/complete", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
  res.json(task);
});
app.use("/activity", activityRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
