import FormData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;

if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
  process.exit(1);
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
  // If using EU domain:
  // url: "https://api.eu.mailgun.net"
});

// ------- Send OTP Function -------
export const sendOtpEmail = async (to, otp) => {
  try {
    const data = await mg.messages.create(MAILGUN_DOMAIN, {
      from: ["Sharefy <belalraza707@gmail.com>"],
      to,
      subject: "Your Sharefy OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
