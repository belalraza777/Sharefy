import React from 'react';
import { Link } from 'react-router-dom';
import FollowButton from '../Buttons/followButton.jsx';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { FiSettings } from 'react-icons/fi';

const ProfileHeader = ({
  user,
  isOwnProfile,
  postsCount,
  followersCount,
  followingCount,
  activeList,
  onOpenList,
  onEditProfile,
  onOpenSettings,
}) => {
  return (

    <div className="profile-header">
      {/* Profile avatar section */}
      <div className="profile-avatar-section">
        <img
          className="profile-avatar"
          src={user?.profileImage || defaultAvatar}
          alt={user.username}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
      </div>
{/* Profile information section */}
      <div className="profile-info">
        <div className="profile-name-section">
          <span className="profile-name">@{user.username}</span>
          {isOwnProfile ? (
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={onEditProfile}>
                Edit Profile
              </button>
              <button className="settings-btn" onClick={onOpenSettings}>
                <FiSettings />
              </button>
            </div>
          ) : (
            <div className="profile-actions">
              <FollowButton userId={user._id} />
              <button className="message-btn secondary-btn">
                <Link to={`/chat/${user._id}`} state={{ user }}>Message</Link>
              </button>
            </div>
          )}
        </div>
{/* Profile stats section */}
        <div className="profile-stats">
          <div className="stat-item">
            <span>{postsCount}</span>
            <span>posts</span>
          </div>
          <div className="stat-item">
            {isOwnProfile ? (
              <button
                className={`stat-button ${activeList === 'followers' ? 'active' : ''}`}
                onClick={() => onOpenList('followers')}
                type="button"
              >
                <span>{followersCount}</span>
                <span>followers</span>
              </button>
            ) : (
              <>
                <span>{followersCount}</span>
                <span>followers</span>
              </>
            )}
          </div>
          <div className="stat-item">
            {isOwnProfile ? (
              <button
                className={`stat-button ${activeList === 'following' ? 'active' : ''}`}
                onClick={() => onOpenList('following')}
                type="button"
              >
                <span>{followingCount}</span>
                <span>following</span>
              </button>
            ) : (
              <>
                <span>{followingCount}</span>
                <span>following</span>
              </>
            )}
          </div>
        </div>

        <div className="profile-details">
          <h3>{user.fullName}</h3>
          {user.bio && <p>{user.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
