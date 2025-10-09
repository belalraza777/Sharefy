import express from "express";
const router = express.Router();
import usersController from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../utils/joiValidation.js";
import verifyAuth from "../utils/verifyAuth.js";
import { authLimiter,otpLimiter } from "../utils/rateLimit.js";


// Login routes
router.post("/login", loginValidation, authLimiter, usersController.loginUser);

// Signup routes
router.post("/register", registerValidation, authLimiter, usersController.register);

// Logout route
router.get("/logout", usersController.logoutUser);

//to Check Login and role in frontend 
router.get("/check", usersController.checkUser);

//reset password
router.patch("/reset", verifyAuth, authLimiter, usersController.resetPassword);

//otp base login 
router.post('/request-otp', otpLimiter, usersController.requestOtp);   // Step 1: Generate & send OTP
router.post('/verify-otp', usersController.verifyOtp);     // Step 2: Verify OTP & login

export default router;