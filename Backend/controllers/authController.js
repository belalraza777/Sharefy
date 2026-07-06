import authService from "../services/authService.js";

// Controller for user login
export const loginUser = async (req, res) => {
    // Destructuring email and password from request body
    const { email, password } = req.body;
    const result = await authService.loginUserService(email, password);
    if (result.token) {
        // Setting token in cookie (5 days to match JWT expiry)
        res.cookie("token", result.token, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
    }
    return res.status(result.statusCode).json(result.body);
};

// Controller for user registration
export const register = async (req, res) => {
    // Destructuring user data from request body
    const { fullName, username, email, password } = req.body;
    const result = await authService.registerService(fullName, username, email, password);
    if (result.token) {
        // Setting token in cookie (5 days to match JWT expiry)
        res.cookie("token", result.token, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
    }
    return res.status(result.statusCode).json(result.body);
};

// Controller for user logout
export const logoutUser = (req, res) => {
    // Clearing the token cookie (match options used when setting cookie)
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    // Returning success response
    return res.json({ success: true, message: "Logout Successfully!" });
};

// Controller to check user login status and role
export const checkUser = async (req, res) => {
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
    const user = await authService.checkUserService(token);
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
export const resetPassword = async (req, res) => {
    // Destructuring old and new password from request body
    const { oldPassword, newPassword } = req.body;
    // Getting user ID from request
    const userId = req.user.id;
    const result = await authService.resetPasswordService(userId, oldPassword, newPassword);
    return res.status(result.statusCode).json(result.body);
};

// Controller to request OTP for login
export const requestOtp = async (req, res) => {
    // Destructuring email from request body
    const { email } = req.body;
    const result = await authService.requestOtpService(email);
    return res.status(result.statusCode).json(result.body);
};

// Controller to verify OTP for login
export const verifyOtp = async (req, res) => {
    // Destructuring email and OTP from request body
    const { email, otp } = req.body;
    const result = await authService.verifyOtpService(email, otp);
    if (result.token) {
        // Setting token in cookie (5 days to match JWT expiry)
        res.cookie('token', result.token, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
            // secure: true,
            // sameSite: 'none',
        });
    }
    return res.status(result.statusCode).json(result.body);
};