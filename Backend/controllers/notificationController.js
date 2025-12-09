import Notification from "../models/notificationModel.js";
import { getCache, setCache, deleteCache } from "../utils/cache.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
    // Check cache first
    const cacheKey = `notifications:${req.user.id}`;
    const cachedNotifications = await getCache(cacheKey);
    if (cachedNotifications) {
        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: cachedNotifications,
        });
    }

    const notifications = await Notification.find({ receiver: req.user.id })
        .populate('sender', 'username profileImage') // Populate sender data
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean(); // Return plain JS objects

    // Cache notifications for 1 minute
    await setCache(cacheKey, notifications, 60);

    res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        data: notifications,
    });
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    await Notification.updateMany(
        { receiver: req.user.id, isRead: false },
        { isRead: true }
    );

    // Invalidate notifications cache
    await deleteCache(`notifications:${req.user.id}`);

    res.json({ success: true, message: 'All notifications marked as read' });
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {

    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found or not authorized" });
    }

    // Invalidate notifications cache
    await deleteCache(`notifications:${req.user.id}`);

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
    });
};


