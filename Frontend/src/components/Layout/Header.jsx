// components/layout/Header.jsx
import './Header.css';
import { useAuth } from "../../context/authContext";
import { Link } from 'react-router-dom';
import defaultAvatar from '../../assets/defaultAvatar.png';
import SearchBar from '../search/SearchBar';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo/Brand */}
        <div className="header-brand">
          <h1 className="logo">Sharefy</h1>
        </div>

        {/* Search Bar - Center */}
        <SearchBar />
        
        {/* User Info */}
        {user && (
          <Link to={`/profile/${user?.username}`} className="user-link">
            <div className="header-user">
              <div className="user-details">
                <div className="user-name">{user.username}</div>
              </div>
              <img
                src={user.profileImage || defaultAvatar}
                alt={`${user.username || "User"}'s avatar`}
                className="user-avatar"
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
