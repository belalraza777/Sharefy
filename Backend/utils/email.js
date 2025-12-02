import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Warn if credentials are missing and verify transporter on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('Warning: EMAIL_USER or EMAIL_PASS not set. Emails will fail in production.');
}
transporter.verify()
  .then(() => console.log('Email transporter configured and ready'))
  .catch((err) => console.error('Email transporter verification failed:', err));

// Function to send OTP email
export const sendOtpEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sharefy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Sharefy OTP',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
    return info;
  } catch (err) {
    console.error(`Failed to send OTP email to ${email}:`, err);
    throw err;
  }
};
