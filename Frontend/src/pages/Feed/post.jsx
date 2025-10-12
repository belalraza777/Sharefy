import LikeButton from '../../components/Buttons/likeButton';
import { FaRegComment} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Post.css';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { useState, useRef, useEffect } from 'react';
import DeletePostButton from '../../components/Buttons/deletePostButton';
import SavePostButton from '../../components/Buttons/savePostButton';


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
          <div ref={moreRef} className="insta-more-options">
            <DeletePostButton post={post} />
            Options coming soon...
          </div>
        )}
      </div>

      {/* Media */}
      {post.media?.url && (
        <div className="insta-post-media">
          {post.media.type === "video" ? (
            <video
              src={post.media.url}
              controls
              className="insta-media-video"
              onClick={() => navigate(`/post/${post._id}`)}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <img
              src={post.media.url}
              alt="Post content"
              className="insta-media-image"
              onClick={() => navigate(`/post/${post._id}`)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      )}

      {/* Caption (now below media) */}
      {post.caption && <div className="insta-post-caption"><span className="insta-username">{post.user.username}</span> {post.caption}</div>}

      {/* Actions: Like, Comment, Save */}
      <div className="insta-post-actions">
        <LikeButton post={post} />
        <button className="insta-action-btn" onClick={() => navigate(`/post/${post._id}`)}>
          <FaRegComment />
        </button>
        <SavePostButton post={post} />
      </div>
    </div>
  );
}
