import Notification from "../models/notificationModel.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ receiver: req.user.id })
        .populate('sender', 'username profileImage') // Populate sender data
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean(); // Return plain JS objects


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

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
    });
};


