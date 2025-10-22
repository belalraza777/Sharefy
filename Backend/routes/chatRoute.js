import express from "express";
import  verifyAuth  from "../utils/verifyAuth.js";
import {
  sendMessage,
  getMessages,
  getUsers,
} from "../controllers/chatController.js";
import asyncWrapper from "../utils/asyncWrapper.js";


const router = express.Router();


// Send a message to a specific user
router.post("/send/:id", verifyAuth, asyncWrapper(sendMessage));

// Get conversation messages with a specific user
router.get("/get/:id", verifyAuth, asyncWrapper(getMessages));

// Get all users except the logged-in user
router.get("/users", verifyAuth, asyncWrapper(getUsers));

export default router;
