import React from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';
import SavedPost from '../../pages/SavedPost/SavedPost';

const ProfilePosts = ({ activeTab, userPosts, isOwnProfile, onPostClick }) => {
  return (
    <div className="profile-posts">
      {activeTab === 'posts' && (
        <>
          {userPosts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">📷</div>
              <h3>No Posts Yet</h3>
              {isOwnProfile && <p>Share your first photo or video!</p>}
            </div>
          ) : (
            <div className="profile-posts-grid">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="profile-post-item"
                  onClick={() => onPostClick(post._id)}
                >
                  {post.media?.type === 'video' ? (
                    <video src={post.media?.url} muted />
                  ) : (
                    <img src={post.media?.url} alt={post.caption} />
                  )}
                  <div className="post-overlay">
                    <span><FaHeart />{post.likes?.length || 0}</span>
                    <span><FaComment />{post.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {activeTab === 'saved' && isOwnProfile && (
        <div className="saved-posts">
          <SavedPost />
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;
