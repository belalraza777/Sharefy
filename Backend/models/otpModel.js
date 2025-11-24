import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true }, // hashed OTP
  expiresAt: { type: Date, required: true, index: true },
}, {
  timestamps: true,
});

// TTL index: document will be removed when `expiresAt` is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
