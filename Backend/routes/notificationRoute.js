import express from "express";
import verifyAuth from "../middlewares/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { getNotifications, markAsRead, markAllAsRead} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", verifyAuth, asyncWrapper(getNotifications));

// Mark all as read 
router.patch('/read-all', verifyAuth, asyncWrapper(markAllAsRead)); 

// Mark a notification as read
router.patch("/:id/read", verifyAuth, asyncWrapper(markAsRead));


export default router;
