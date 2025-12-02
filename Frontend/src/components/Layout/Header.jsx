// components/layout/Header.jsx
import './header.css';
import { useAuth } from "../../context/authContext";
import { Link } from 'react-router-dom';
import defaultAvatar from '../../assets/defaultAvatar.png';
import SearchBar from '../search/SearchBar';
import logo from '../../assets/logo.png';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <img src={logo} alt="Sharefy Logo" className="brand-logo" />
        </div>

        <div className="header-center">
          <SearchBar />
        </div>

        <div className="header-user-area">
          {user ? (
            <Link to={`/profile/${user.username}`} className="user-link">
              <img
                src={user.profileImage || defaultAvatar}
                alt={user.username || 'User'}
                className="user-avatar"
                onError={(e) => { e.currentTarget.src = defaultAvatar; }}
              />
              <span className="user-name">{user.username}</span>
            </Link>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
