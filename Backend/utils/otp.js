import { authenticator } from 'otplib';

export const generateOTP = () => {
  return authenticator.generate(authenticator.generateSecret());
};

