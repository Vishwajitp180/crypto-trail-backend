import express from "express";
import Activity from "../models/Activity.js";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/add", async (req, res) => {
  try {
    const { name, dateTime, userEmail } = req.body;

    // save to MongoDB
    const activity = new Activity({ name, dateTime, userEmail });
    await activity.save();

    // send reminder email
    const mailOptions = {
      from: `"Agri Diary" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🌱 Activity Reminder",
      html: `
        <h2>New Activity Added</h2>
        <p><b>Activity:</b> ${name}</p>
        <p><b>When:</b> ${new Date(dateTime).toLocaleString()}</p>
        <p>Don't forget to update your Agri Diary! ✅</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Activity saved & reminder sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding activity" });
  }
});

export default router;
