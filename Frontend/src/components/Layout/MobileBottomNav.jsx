// components/MobileBottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPlusSquare,
  FiHeart,
  FiMessageCircle,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import useNotificationStore from '../../store/notificationStore';
import './Layout.css'; // Keep your main layout styling

const MobileBottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    // Removed search to free up space on mobile
    { path: '/new-post', icon: <FiPlusSquare />, label: 'Create' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/notifications', icon: <FiHeart />, label: 'Alerts' },
    // Profile: links to the logged-in user's profile (falls back to '/profile')
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
              {item.icon}
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
