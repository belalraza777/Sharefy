// components/MobileBottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiSettings,
} from 'react-icons/fi';
import './Layout.css'; // Keep your main layout styling

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/search', icon: <FiSearch />, label: 'Explore' },
    { path: '/new-post', icon: <FiPlusSquare />, label: 'Create' },
    { path: '/notifications', icon: <FiHeart />, label: 'Alerts' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
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
            <span className="mobile-nav-icon">{item.icon}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
