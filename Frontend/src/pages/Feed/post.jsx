import LikeButton from '../../components/Buttons/likeButton';
import { FaRegComment} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Post.css';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { useState } from 'react';
import DeletePostButton from '../../components/Buttons/deletePostButton';
import SavePostButton from '../../components/Buttons/savePostButton';


export default function Post({ post }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('img')) return;
    navigate(`/post/${post._id}`);
  };

  const handleProfileClick = (e) => {
    navigate(`/profile/${post.user.username}`);
  };

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen);
  };


  return (
    <div className="post-card" onClick={handleCardClick}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-user">
          <img
            src={post.user?.profileImage || defaultAvatar}
            alt={`${post.user?.username || "User"}'s avatar`}
            className="user-avatar"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
            onClick={handleProfileClick}
          />

          <div className="user-info">
            <div className="username">{post.user.username}</div>
            <div className="post-time">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {/* more options */}
        <div className="more-container" style={{ position: 'relative' }}>
          <button className="more-btn" onClick={handleMoreClick}>⋯</button>
          {moreOpen && (
            <div className="more-options">
              <DeletePostButton post={post} />
              Options coming soon...
            </div>
          )}
        </div>
      </div>


      {/* Post Caption */}
      {post.caption && <div className="post-caption">{post.caption}</div>}

      {/* Post Media */}
      {post.media?.url && (
        <div className="post-media">
          {post.media.type === "video" ? (
            <video
              src={post.media.url}
              controls
              className="media-video"
            />
          ) : (
            <img
              src={post.media.url}
              alt="Post content"
              className="media-image"
            />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="post-stats">
        <div className="likes-count">
          <LikeButton post={post} big /> {/* <-- add "big" prop */}
        </div>
        <div className="comments-count">
          <FaRegComment className="comment-icon" />
          {post?.comments?.length} comments
        </div>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className="action-btn comment-btn"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <FaRegComment /> Comment
        </button>
        <div className="action-btn">
          <SavePostButton post={post} />
        </div>
      </div>
    </div>
  );
}
