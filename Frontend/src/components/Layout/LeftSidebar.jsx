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
import useChatStore from '../../store/chatStore';
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
  // Sum all unread message counts from chat store
  const unreadMsgCounts = useChatStore((s) => s.unreadCounts);
  const totalUnreadMessages = Object.values(unreadMsgCounts).reduce((a, b) => a + b, 0);
  
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
                  {item.path === '/chat' && totalUnreadMessages > 0 && (
                    <span className="notification-badge">{totalUnreadMessages}</span>
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
