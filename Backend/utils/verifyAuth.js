import jwt from "jsonwebtoken";

const verifyAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in!",
            error: "Unauthorized"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
                error: "Forbidden"
            });
        }
        req.user = user;
        next();
    });
};

export default verifyAuth;