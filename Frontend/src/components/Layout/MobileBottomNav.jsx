// components/MobileBottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiMessageCircle,
} from 'react-icons/fi';
import useNotificationStore from '../../store/notificationStore';
import './Layout.css'; // Keep your main layout styling

const MobileBottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  
  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/search', icon: <FiSearch />, label: 'Explore' },
    { path: '/new-post', icon: <FiPlusSquare />, label: 'Create' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/notifications', icon: <FiHeart />, label: 'Alerts' },
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
