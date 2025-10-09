import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Sharefy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Sharefy OTP',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`
  });
};
