import express from "express";
const router = express.Router();
import usersController from "../controllers/authController.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { registerValidation, loginValidation } from "../utils/joiValidation.js";
import verifyAuth from "../utils/verifyAuth.js";
import { authLimiter,otpLimiter } from "../utils/rateLimit.js";


// Login routes
router.post("/login", loginValidation, authLimiter, asyncWrapper(usersController.loginUser));

// Signup routes
router.post("/register", registerValidation, authLimiter, asyncWrapper(usersController.register));

// Logout route 
router.get("/logout", usersController.logoutUser);

//to Check Login and role in frontend 
router.get("/check", asyncWrapper(usersController.checkUser));

//reset password
router.patch("/reset", verifyAuth, authLimiter, asyncWrapper(usersController.resetPassword));

//otp base login 
router.post('/request-otp', otpLimiter, asyncWrapper(usersController.requestOtp));   // Step 1: Generate & send OTP
router.post('/verify-otp',otpLimiter, asyncWrapper(usersController.verifyOtp));     // Step 2: Verify OTP & login

export default router;