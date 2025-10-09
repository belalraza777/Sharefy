import useNotificationStore from '../../store/notificationStore'
import { useEffect } from 'react'
import './Notification.css'

export default function Notification() {
    const { notifications, getNotifications, markAsRead } = useNotificationStore()
    
    useEffect(() => {
        getNotifications()
    }, [])

    console.log(notifications);
    
    // Mark notification as read when clicked
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id)
        }
    }

    if (notifications.length === 0) {
        return (
            <div className="notifications-page">
                <h2>Notifications</h2>
                <div className="empty-notifications">
                    <p>No notifications yet</p>
                </div>
            </div>
        )
    }

    return (
        <div className="notifications-page">
            <h2>Notifications</h2>
            
            <div className="notifications-list">
                {notifications.map(notification => (
                    <div 
                        key={notification._id} 
                        className={`notification ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <div className="notification-avatar">
                            {notification.sender?.profileImage ? (
                                <img src={notification.sender.profileImage} alt="avatar" />
                            ) : (
                                <div className="default-avatar">
                                    {notification.sender?.username?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="notification-content">
                            <p>
                                <strong>{notification.sender?.username || 'Someone'}</strong> 
                                {' ' + notification.message}
                            </p>
                            <span className="time">
                                {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {!notification.isRead && <div className="unread-dot"></div>}
                    </div>
                ))}
            </div>
        </div>
    )
}