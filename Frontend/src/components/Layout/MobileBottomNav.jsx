// components/MobileBottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPlusSquare,
  FiHeart,
  FiMessageCircle,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import useNotificationStore from '../../store/notificationStore';
import useChatStore from '../../store/chatStore';
import defaultAvatar from '../../assets/defaultAvatar.png';
import './MobileBottomNav.css'; // Mobile bottom nav styling

const MobileBottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  // Sum all unread message counts from chat store
  const unreadMsgCounts = useChatStore((s) => s.unreadCounts);
  const totalUnreadMessages = Object.values(unreadMsgCounts).reduce((a, b) => a + b, 0);
  
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/new-post', icon: <FiPlusSquare />, label: 'Create' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/notifications', icon: <FiHeart />, label: 'Alerts' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
    { path: user ? `/profile/${user.username}` : '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-items">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${
              location.pathname === item.path ? 'active' : ''
            }`}
          >
            <span className="mobile-nav-icon">
              {item.path.startsWith('/profile') ? (
                <img
                  src={user?.profileImage || defaultAvatar}
                  alt={user?.username || 'Profile'}
                  className="mobile-nav-avatar"
                  onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                />
              ) : (
                item.icon
              )}
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
              {item.path === '/chat' && totalUnreadMessages > 0 && (
                <span className="notification-badge">{totalUnreadMessages}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
