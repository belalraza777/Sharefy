// CreatePostBar.jsx
import React from 'react';
import './CreatePostBar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { IoImagesOutline } from 'react-icons/io5';
import { CiVideoOn } from 'react-icons/ci';

// Quick post creation entry used across feed views
export default function CreatePostBar() {
  const { user } = useAuth();
  return (
    <div className="create-post-bar">
      <div className="create-post-bar__left">
        <div className="create-post-bar__avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.username} />
          ) : (
            <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </div>

        <Link to="/new-post" className="create-post-bar__placeholder">
          What's on your mind, {user?.username || 'there'}?
        </Link>
      </div>

      <div className="create-post-bar__actions">
        <Link to="/new-post" className="create-post-bar__action" aria-label="Add photo">
          <IoImagesOutline />
        </Link>
        <Link to="/new-post" className="create-post-bar__action" aria-label="Add video">
          <CiVideoOn />
        </Link>
      </div>
    </div>
  );
}
