// components/layout/LeftSidebar.jsx
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMessageCircle,
  FiBookmark,
  FiFeather,
  FiSettings,
} from 'react-icons/fi';
import useNotificationStore from '../../store/notificationStore';
import './LeftSidebar.css';

const MENU_ITEMS = [
  { path: '/', Icon: FiHome, label: 'Home' },
  { path: '/search', Icon: FiSearch, label: 'Explore' },
  { path: '/notifications', Icon: FiBell, label: 'Notifications' },
  { path: '/chat', Icon: FiMessageCircle, label: 'Messages' },
  { path: '/saved', Icon: FiBookmark, label: 'Saved' },
  { path: '/theme', Icon: FiFeather, label: 'Theme' },
  { path: '/settings', Icon: FiSettings, label: 'Settings' },
];

const LeftSidebar = memo(function LeftSidebar() {
  const location = useLocation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {MENU_ITEMS.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <item.Icon />
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
});

export default LeftSidebar;
