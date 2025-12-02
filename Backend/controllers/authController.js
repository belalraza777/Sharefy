import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import Otp from "../models/otpModel.js";


// Controller for user login
const loginUser = async (req, res, next) => {
    // Destructuring email and password from request body
    const { email, password } = req.body;
    // Finding user by email
    const user = await User.findOne({ email }).populate("followers following");
    // If user does not exist, return error
    if (!user) {
        return res.status(400).json({ success: false, message: "User not exist!", error: "Authentication Failed" });
    }
    // Comparing password with hashed password
    const matchPassword = await bcrypt.compare(password, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return res.status(400).json({ success: false, message: "Invalid credentials!", error: "Authentication Failed" });
    }
    // Generating JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
    // Setting token in cookie (5 days to match JWT expiry)
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });

    // Returning success response with user data
    return res.status(200).json({ success: true, message: "Welcome Back!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } });
};


// Controller for user registration
const register = async (req, res, next) => {
    // Destructuring user data from request body
    const { fullName, username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        if (existingUser.email === email) {
            return res.status(400).json({ success: false, message: "Email is already in use.", error: "Authentication Failed" });
        }
        if (existingUser.username === username) {
            return res.status(400).json({ success: false, message: "Username is already taken.", error: "Authentication Failed" });
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
    // Setting token in cookie (5 days to match JWT expiry)
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });
    // Returning success response with user data
    return res.status(201).json({ success: true, message: "Account Created Successfully!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } });
};


// Controller for user logout
const logoutUser = (req, res, next) => {
    // Clearing the token cookie (match options used when setting cookie)
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    // Returning success response
    return res.json({ success: true, message: "Logout Successfully!" });
};


// Controller to check user login status and role
const checkUser = async (req, res, next) => {
    // Getting token from cookies or Authorization header
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    // If no token, return unauthorized status
    if (!token) {
        return res.sendStatus(401);
    }
    //Verifying Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.sendStatus(401);
    }

    const user = await User.findById(decoded.id).select('-passwordHash').populate("followers following");
    if (!user) {
        return res.sendStatus(401);
    }

    res.status(200).json({
        authenticated: true,
        message: "Authenticated",
        data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following }
    });
};


// Controller to reset user password
const resetPassword = async (req, res, next) => {
    // Destructuring old and new password from request body
    const { oldPassword, newPassword } = req.body;
    // Getting user ID from request
    const userId = req.user.id;
    // Finding user by ID
    const user = await User.findById(userId);
    // If user not found, return error
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    // Comparing old password with hashed password
    const matchPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return res.status(401).json({ success: false, message: "Wrong Password", error: "Wrong Password" });
    }
    // Hashing the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    // Updating user's password hash
    user.passwordHash = hash;
    // Saving the updated user data
    await user.save();
    // Returning success response
    return res.status(201).json({ success: true, message: "Password Changed Successfully", data: "password changed" });
}


// Controller to request OTP for login
const requestOtp = async (req, res, next) => {
    // Destructuring email from request body
    const { email } = req.body;
    // If email is not provided, return error
    if (!email) return res.status(400).json({ message: 'Email is required' });
    // Finding user by email
    const user = await User.findOne({ email });
    // If user not found, return error
    if (!user) return res.status(400).json({ message: 'User not found' });

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
    return res.json({ message: `OTP sent to ${email}` });
};

// Controller to verify OTP for login
const verifyOtp = async (req, res, next) => {
    // Destructuring email and OTP from request body
    const { email, otp } = req.body;
    // Finding user by email
    const user = await User.findOne({ email }).select('-passwordHash');
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    // Fetch OTP document for this user
    const otpDoc = await Otp.findOne({ user: user._id });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid request' });

    // If OTP is expired, remove and return error
    if (otpDoc.expiresAt < new Date()) {
        await Otp.deleteMany({ user: user._id });
        return res.status(400).json({ message: 'OTP expired' });
    }

    // Comparing provided OTP with stored hashed OTP
    const isOtpValid = await bcrypt.compare(otp, otpDoc.code);
    if (!isOtpValid) return res.status(400).json({ message: 'Incorrect OTP' });

    // If OTP is valid, generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5d' });

    // Setting token in cookie (5 days to match JWT expiry)
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
        // secure: true,
        // sameSite: 'none',
    });

    // Clean up OTP documents for user
    await Otp.deleteMany({ user: user._id });

    // Returning success response with token
    return res.status(200).json({ success: true, message: "Welcome Back!", data: { id: user._id, token, fullName: user.fullName, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, followers: user.followers, following: user.following } });
};



// Exporting all the controller functions
export default {
    loginUser,
    register,
    logoutUser,
    checkUser,
    resetPassword,
    requestOtp,
    verifyOtp,
};