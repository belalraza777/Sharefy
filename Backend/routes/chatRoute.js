import express from "express";
import  verifyAuth  from "../middlewares/verifyAuth.js";
import {
  sendMessage,
  getMessages,
  getUsers,
} from "../controllers/chatController.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { messageValidation } from "../middlewares/joiValidation.js";


const router = express.Router();


// Send a message to a specific user
router.post("/send/:id", verifyAuth, messageValidation, asyncWrapper(sendMessage));

// Get conversation messages with a specific user
router.get("/get/:id", verifyAuth, asyncWrapper(getMessages));

// Get all users the logged-in user has chatted with
router.get("/users", verifyAuth, asyncWrapper(getUsers));

export default router;
