// app.js
import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import helmet from "helmet";
import {globalLimiter} from "./utils/rateLimit.js";
import AuthRouter from "./routes/authRoute.js";
import UserRouter from "./routes/userRoute.js";
import PostRouter from "./routes/postRoute.js";
import CommentRouter from "./routes/commentRoute.js";
import NotificationRouter from "./routes/notificationRoute.js";
import SavedPostRouter from "./routes/savedPostRoute.js";
import SearchRouter from "./routes/searchRoute.js";
import ErrorHandle from "./utils/errorClass.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // allows sending cookies
}));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(helmet()); // Set security-related HTTP headers
app.use(globalLimiter); // Rate limiting



// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => res.send("Welcome to Sharefy"));
app.get("/api/v1/health", (req, res) => res.status(200).json({ success: true, message: "Server is running " }));

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/posts", PostRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/notifications", NotificationRouter);
app.use("/api/v1/saved-posts", SavedPostRouter);
app.use("/api/v1/search", SearchRouter);

// Unknown route
app.use((req, res, next) => {
  next(new ErrorHandle(404, "Not Found"));
});

// Error handling
app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error" } = err;
  return res.status(status).json({ success: false, message, error: message });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Max 10MB allowed." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === "Invalid file type. Only images and videos are allowed.") {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default app;
