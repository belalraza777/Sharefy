import LikeButton from '../../components/Buttons/likeButton';
import { LuMessageCircle } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import './post.css';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { useState, useRef, useEffect } from 'react';
import SavePostButton from '../../components/Buttons/savePostButton';
import ShareButton from '../../components/Buttons/shareButton';
import PostOptionsMenu from '../../components/post/PostOptionsMenu';
import getOptimizedImage from '../../helper/getOptimizedUrl';


export default function Post({ post }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef();
  const navigate = useNavigate();

  // Close more options when clicking outside
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

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
    <div className="insta-post-card">
      {/* Header: Avatar, Username, More */}
      <div className="insta-post-header">
        <div className="insta-post-user" onClick={handleProfileClick}>
          <img
            src={post.user?.profileImage || defaultAvatar}
            alt={post.user?.username || "User"}
            className="insta-user-avatar"
            onError={e => { e.currentTarget.src = defaultAvatar; }}
          />
          <span className="insta-username">{post.user.username}</span>
          <span className="insta-dot">•</span>
          <span className="insta-time">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <button className="insta-more-btn" onClick={handleMoreClick}>⋯</button>
        {moreOpen && (
          <div ref={moreRef}>
            <PostOptionsMenu post={post} onClose={() => setMoreOpen(false)} />
          </div>
        )}
      </div>

      {/* Media */}
      {post.media?.url && (
        <div className="insta-post-media">
          {post.media.type === "video" ? (
            <video
              src={getOptimizedImage(post.media.url, 600)}
              controls
              className="insta-media-video"
              onClick={() => navigate(`/post/${post._id}`)}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <img
              src={getOptimizedImage(post.media.url, 600)}
              alt="Post content"
              className="insta-media-image"
              width={600}
              height={600}
              loading="eager"   // Eager loading for better LCP
              fetchpriority="high"  // High priority fetch for post media
              decoding="async" // Async decoding for better performance
              onClick={() => navigate(`/post/${post._id}`)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      )}

      {/* Caption (now below media) */}
      {post.caption && <div className="insta-post-caption"><span className="insta-username">{post.user.username}</span> {post.caption}</div>}

      {/* Stats: Likes and Comments count */}
      {(post.likes?.length > 0 || post.comments?.length > 0) && (
        <div className="insta-post-stats">
          {post.likes?.length > 0 && (
            <span className="stat-item">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
          )}
          {post.comments?.length > 0 && (
            <span className="stat-item">{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      )}

      {/* Actions: Like, Comment, Share, Save */}
      <div className="insta-post-actions">
        <LikeButton post={post} />
        <button
          className="insta-action-btn"
          onClick={() => navigate(`/post/${post._id}`)}
          aria-label="Comment on post"
        >
          <LuMessageCircle />
        </button>
        <ShareButton post={post} />
        <SavePostButton post={post} />
      </div>
    </div>
  );
}
