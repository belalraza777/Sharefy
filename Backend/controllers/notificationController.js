import notificationService from "../services/notificationService.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
    const notifications = await notificationService.getNotificationsService(req.user.id);
    res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        data: notifications,
    });
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    await notificationService.markAllAsReadService(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
    const notification = await notificationService.markAsReadService(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
    });
};