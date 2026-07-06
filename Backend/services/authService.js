import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import Otp from "../models/otpModel.js";

// Service for user login
const loginUserService = async (email, password) => {
    // Finding user by email
    const user = await User.findOne({ email }).populate("followers following");
    // If user does not exist, return error
    if (!user) {
        return { statusCode: 400, body: { success: false, message: "User not exist!", error: "Authentication Failed" } };
    }
    // Comparing password with hashed password
    const matchPassword = await bcrypt.compare(password, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return { statusCode: 400, body: { success: false, message: "Invalid credentials!", error: "Authentication Failed" } };
    }
    // Generating JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
    // Returning success response with user data
    return {
        statusCode: 200,
        token,
        body: { success: true, message: "Welcome Back!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } }
    };
};

// Service for user registration
const registerService = async (fullName, username, email, password) => {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        if (existingUser.email === email) {
            return { statusCode: 400, body: { success: false, message: "Email is already in use.", error: "Authentication Failed" } };
        }
        if (existingUser.username === username) {
            return { statusCode: 400, body: { success: false, message: "Username is already taken.", error: "Authentication Failed" } };
        }
    }
    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    // Creating a new user
    const newUser = new User({ fullName, username, email, passwordHash: hash });
    // Saving the new user to the database
    const user = await newUser.save();
    // Generating JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
    // Returning success response with user data
    return {
        statusCode: 201,
        token,
        body: { success: true, message: "Account Created Successfully!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } }
    };
};

// Service to verify a token and fetch the associated user
const checkUserService = async (token) => {
    // Verifying Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return null;
    }
    const user = await User.findById(decoded.id).select('-passwordHash').populate("followers following");
    return user;
};

// Service to reset user password
const resetPasswordService = async (userId, oldPassword, newPassword) => {
    // Finding user by ID
    const user = await User.findById(userId);
    // If user not found, return error
    if (!user) {
        return { statusCode: 404, body: { success: false, message: "User not found" } };
    }
    // Comparing old password with hashed password
    const matchPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return { statusCode: 401, body: { success: false, message: "Wrong Password", error: "Wrong Password" } };
    }
    // Hashing the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    // Updating user's password hash
    user.passwordHash = hash;
    // Saving the updated user data
    await user.save();
    // Returning success response
    return { statusCode: 201, body: { success: true, message: "Password Changed Successfully", data: "password changed" } };
};

// Service to request OTP for login
const requestOtpService = async (email) => {
    // If email is not provided, return error
    if (!email) {
        return { statusCode: 400, body: { message: 'Email is required' } };
    }
    // Finding user by email
    const user = await User.findOne({ email });
    // If user not found, return error
    if (!user) {
        return { statusCode: 400, body: { message: 'User not found' } };
    }
    // Generating OTP and hashing before storing in TTL-backed collection
    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    // remove any existing OTP documents for this user
    await Otp.deleteMany({ user: user._id });
    // create a new OTP doc with expiry (5 minutes)
    const otpDoc = new Otp({ user: user._id, code: hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await otpDoc.save();
    // Send OTP to user's email (plaintext)
    await sendOtpEmail(email, otp);
    return { statusCode: 200, body: { message: `OTP sent to ${email}` } };
};

// Service to verify OTP for login
const verifyOtpService = async (email, otp) => {
    // Finding user by email
    const user = await User.findOne({ email }).select('-passwordHash');
    if (!user) {
        return { statusCode: 400, body: { message: 'Invalid request' } };
    }
    // Fetch OTP document for this user
    const otpDoc = await Otp.findOne({ user: user._id });
    if (!otpDoc) {
        return { statusCode: 400, body: { message: 'Invalid request' } };
    }
    // If OTP is expired, remove and return error
    if (otpDoc.expiresAt < new Date()) {
        await Otp.deleteMany({ user: user._id });
        return { statusCode: 400, body: { message: 'OTP expired' } };
    }
    // Comparing provided OTP with stored hashed OTP
    const isOtpValid = await bcrypt.compare(otp, otpDoc.code);
    if (!isOtpValid) {
        return { statusCode: 400, body: { message: 'Incorrect OTP' } };
    }
    // If OTP is valid, generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5d' });
    // Clean up OTP documents for user
    await Otp.deleteMany({ user: user._id });
    // Returning success response with token
    return {
        statusCode: 200,
        token,
        body: { success: true, message: "Welcome Back!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } }
    };
};

export default {
    loginUserService,
    registerService,
    checkUserService,
    resetPasswordService,
    requestOtpService,
    verifyOtpService,
};