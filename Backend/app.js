// app.js
import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import { globalLimiter } from "./utils/rateLimit.js";
import AuthRouter from "./routes/authRoute.js";
import UserRouter from "./routes/userRoute.js";
import PostRouter from "./routes/postRoute.js";
import CommentRouter from "./routes/commentRoute.js";
import NotificationRouter from "./routes/notificationRoute.js";
import SavedPostRouter from "./routes/savedPostRoute.js";
import SearchRouter from "./routes/searchRoute.js";
import ChatRouter from "./routes/chatRoute.js";
import StoryRouter from "./routes/storyRoute.js";
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
app.use(helmet()); // Set security-related HTTP headers
app.use(globalLimiter); // Rate limiting
app.use(morgan("dev")); // Logging HTTP requests


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => res.send("Welcome to Sharefy"));
app.get("/api/v1/health", (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  };
  res.status(200).json(health);
});

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/posts", PostRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/notifications", NotificationRouter);
app.use("/api/v1/saved-posts", SavedPostRouter);
app.use("/api/v1/search", SearchRouter);
app.use("/api/v1/chat", ChatRouter);
app.use("/api/v1/stories", StoryRouter);

// Unknown route
app.use((req, res, next) => {
  next(new ErrorHandle(404, "Not Found"));
});

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const isProd = process.env.NODE_ENV === 'production';

  // Log detailed error information to the server console for debugging
  console.error(`\n[Error] ${req.method} ${req.originalUrl}`);
  if (err.stack) console.error(err.stack);

  // In development, include the stack to quickly identify the source
  const payload = {
    success: false,
    message,
    error: message,
    ...(isProd ? {} : { stack: err.stack })
  };

  return res.status(status).json(payload);
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
