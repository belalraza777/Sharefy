import Notification from "../models/notificationModel.js";
import { getCache, setCache, deleteCache } from "../utils/cache.js";

// Get all notifications for the authenticated user
const getNotificationsService = async (userId) => {
    // Check cache first
    const cacheKey = `notifications:${userId}`;
    const cachedNotifications = await getCache(cacheKey);
    if (cachedNotifications) {
        return cachedNotifications;
    }
    const notifications = await Notification.find({ receiver: userId })
        .populate('sender', 'username profileImage') // Populate sender data
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean(); // Return plain JS objects
    // Cache notifications for 1 minute
    await setCache(cacheKey, notifications, 60);
    return notifications;
};

// Mark all notifications as read
const markAllAsReadService = async (userId) => {
    await Notification.updateMany(
        { receiver: userId, isRead: false },
        { isRead: true }
    );
    // Invalidate notifications cache
    await deleteCache(`notifications:${userId}`);
};

// Mark a specific notification as read
const markAsReadService = async (notificationId, userId) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        throw Object.assign(new Error("Notification not found or not authorized"), { statusCode: 404 });
    }
    // Invalidate notifications cache
    await deleteCache(`notifications:${userId}`);
    return notification;
};

export default {
    getNotificationsService,
    markAllAsReadService,
    markAsReadService,
};