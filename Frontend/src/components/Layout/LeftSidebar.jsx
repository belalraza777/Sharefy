// components/layout/LeftSidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMessageCircle,
  FiBookmark,
  FiBarChart2,
  FiFeather,
  FiSettings,
} from 'react-icons/fi';
import useNotificationStore from '../../store/notificationStore';
import './LeftSidebar.css';

const LeftSidebar = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  const menuItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/search', icon: <FiSearch />, label: 'Explore' },
    { path: '/notifications', icon: <FiBell />, label: 'Notifications' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/saved', icon: <FiBookmark />, label: 'Saved' },
    { path: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { path: '/theme', icon: <FiFeather />, label: 'Theme' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  {item.icon}
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default LeftSidebar;
