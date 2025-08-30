// backend/utils/email.js
const nodemailer = require("nodemailer");

// Configure transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your_email@gmail.com",
    pass: process.env.EMAIL_PASS || "your_app_password",
  },
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Message text
 */
async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"Agri Diary" <${process.env.EMAIL_USER || "your_email@gmail.com"}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

module.exports = { sendEmail };
