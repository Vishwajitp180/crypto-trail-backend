import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("📧 Using email:", process.env.EMAIL_USER);
console.log("🔑 Password length:", process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: "movies180304@gmail.com",
  subject: "Test Email",
  text: "This is a test email from Nodemailer!",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("❌ Email sending failed:", error);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});
