import express from "express";
const router = express.Router();
import { loginUser, register, logoutUser, checkUser, resetPassword, requestOtp, verifyOtp } from "../controllers/authController.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { registerValidation, loginValidation } from "../middlewares/joiValidation.js";
import verifyAuth from "../middlewares/verifyAuth.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimit.js";


// Login routes
router.post("/login", loginValidation, authLimiter, asyncWrapper(loginUser));

// Signup routes
router.post("/register", registerValidation, authLimiter, asyncWrapper(register));

// Logout route 
router.get("/logout", logoutUser);

//to Check Login and role in frontend 
router.get("/check", asyncWrapper(checkUser));

//reset password
router.patch("/reset", verifyAuth, authLimiter, asyncWrapper(resetPassword));

//otp base login 
router.post('/request-otp', otpLimiter, asyncWrapper(requestOtp));   // Step 1: Generate & send OTP
router.post('/verify-otp', otpLimiter, asyncWrapper(verifyOtp));     // Step 2: Verify OTP & login

export default router;