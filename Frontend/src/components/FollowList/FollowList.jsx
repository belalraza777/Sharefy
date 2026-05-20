import React from 'react';
import { Link } from 'react-router-dom';
import FollowButton from '../Buttons/followButton.jsx';
import Skeleton, { SkeletonUser } from '../Skeleton/Skeleton';
import defaultAvatar from '../../assets/defaultAvatar.png';
import './FollowList.css';

const FollowList = ({
  title,
  users = [],
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  emptyText = 'No users found',
  showFollowButton = true,
}) => {
  return (
    <div className="follow-list">
      {title && (
        <div className="follow-list-header">
          <h3>{title}</h3>
        </div>
      )}

      {error && <div className="follow-list-error">{error}</div>}

      <div className="follow-list-items">
        {loading && users.length === 0 && (
          <div className="follow-list-skeletons">
            <SkeletonUser />
            <SkeletonUser />
            <SkeletonUser />
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <div className="follow-list-empty">{emptyText}</div>
        )}

        {users.map((item) => (
          <div key={item._id} className="follow-list-item">
            <Link to={`/profile/${item.username}`} className="follow-list-user">
              <img
                src={item.profileImage || defaultAvatar}
                alt={item.username}
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              <span>@{item.username}</span>
            </Link>
            {showFollowButton && <FollowButton userId={item._id} />}
          </div>
        ))}
      </div>

      {loading && users.length > 0 && (
        <div className="follow-list-loading">
          <Skeleton variant="text" width="120px" height="12px" />
        </div>
      )}

      {hasMore && !loading && (
        <button className="follow-list-load" onClick={onLoadMore}>
          Load more
        </button>
      )}
    </div>
  );
};

export default FollowList;
