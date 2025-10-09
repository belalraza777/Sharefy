import express from "express";
const router = express.Router();
import usersController from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../utils/joiValidation.js";
import verifyAuth from "../utils/verifyAuth.js";


// Login routes
router.post("/login", loginValidation, usersController.loginUser);

// Signup routes
router.post("/register", registerValidation, usersController.register);

// Logout route
router.get("/logout", usersController.logoutUser);

//to Check Login and role in frontend 
router.get("/check", usersController.checkUser);

//reset password
router.patch("/reset", verifyAuth, usersController.resetPassword);

//otp base login 
router.post('/request-otp', usersController.requestOtp);   // Step 1: Generate & send OTP
router.post('/verify-otp', usersController.verifyOtp);     // Step 2: Verify OTP & login

export default router;