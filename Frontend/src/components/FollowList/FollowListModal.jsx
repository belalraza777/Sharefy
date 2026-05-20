import React from 'react';
import FollowList from './FollowList.jsx';
import { IoIosCloseCircleOutline } from "react-icons/io";


const FollowListModal = ({
  activeList,
  isOpen,
  followers,
  following,
  followersLoading,
  followingLoading,
  followersError,
  followingError,
  followersHasMore,
  followingHasMore,
  onLoadMoreFollowers,
  onLoadMoreFollowing,
  onClose,
}) => {
  if (!isOpen) return null;

  const isFollowers = activeList === 'followers';
  const title = isFollowers ? 'Followers' : 'Following';

  return (
    <div className="follow-modal" onClick={onClose}>
      <div className="follow-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h3>{title}</h3>
          <button className="follow-modal-close" onClick={onClose} type="button">
            <IoIosCloseCircleOutline  className='follow-model-close-icon'/>
          </button>
        </div>
        {isFollowers ? (
          <FollowList
            title=""
            users={followers}
            loading={followersLoading}
            error={followersError}
            hasMore={followersHasMore}
            onLoadMore={onLoadMoreFollowers}
            emptyText="No followers yet"
          />
        ) : (
          <FollowList
            title=""
            users={following}
            loading={followingLoading}
            error={followingError}
            hasMore={followingHasMore}
            onLoadMore={onLoadMoreFollowing}
            emptyText="Not following anyone yet"
          />
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
