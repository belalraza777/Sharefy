// app.js
import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRouter from "./routes/authRoute.js";
import UserRouter from "./routes/userRoute.js";
import PostRouter from "./routes/postRoute.js";
import CommentRouter from "./routes/commentRoute.js";
import NotificationRouter from "./routes/notificationRoute.js";
import savedRoutes from "./routes/savedPostRoute.js";
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


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => res.send("Welcome to Sharefy"));
app.use("/api/auth/", AuthRouter);
app.use("/api/users/", UserRouter);
app.use("/api/posts/", PostRouter);
app.use("/api/comments/", CommentRouter);
app.use("/api/notifications/", NotificationRouter);
app.use('/api/saved/', savedRoutes);
app.use("/api/search", SearchRouter);

// Unknown route
app.use((req, res, next) => {
  next(new ErrorHandle(404, "Not Found"));
});

// Error handling
app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error" } = err;
  return res.status(status).json({ success: false, message, error: message });
});

export default app;
