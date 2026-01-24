import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePostStore from '../../store/postStore';
import useCommentStore from '../../store/commentStore';
import LikeButton from '../../components/Buttons/likeButton';
import ShareButton from '../../components/Buttons/shareButton';
import { FaRegComment } from 'react-icons/fa';
import defaultAvatar from '../../assets/defaultAvatar.png';
import Comment from './comment';
import CommentForm from './commentForm';
import './singlePost.css';
import PostOptionsMenu from '../../components/post/PostOptionsMenu';
import { toast } from 'sonner';
import Skeleton from '../../components/Skeleton/Skeleton';


export default function SinglePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { getPostById, post } = usePostStore();
  const { addComment, deleteComment } = useCommentStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef();
  

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

  async function fetchPost() {
    await getPostById(postId);
  }

  useEffect(() => {
    fetchPost();
  }, [postId, getPostById]);


  if (!post) return <div className="loading-container">
     <Skeleton variant="post" className="loading-skeleton" />
     <Skeleton variant="text" className="loading-skeleton" />
     <Skeleton variant="text" className="loading-skeleton" />
  </div>;

  const refreshPost = async () => await getPostById(postId);

  const handleDeleteComment = async (commentId) => {
    try {
     const result = await deleteComment(postId, commentId);
      if (!result.success) {
        toast.error(result.message || 'Failed to delete comment');
        return;
      }
      await refreshPost();
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.user.username}`);
  };

  return (
    <div className="single-post-container">
      <div className="post-card">
        {/* Post Header */}
        <div className="post-header">
          <div className="post-user" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <img
              src={post.user?.profileImage || defaultAvatar}
              alt={`${post.user?.username || 'User'}'s avatar`}
              className="user-avatar"
              onError={(e) => (e.currentTarget.src = defaultAvatar)}
            />
            <div className="user-info">
              <div className="username">{post.user.username}</div>
              <div className="post-time">
                {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* more options */}
          <div className="more-container" style={{ position: 'relative' }}>
            <button className="more-btn" onClick={handleMoreClick}>⋯</button>
            {moreOpen && (
              <div ref={moreRef}>
                <PostOptionsMenu post={post} onClose={() => setMoreOpen(false)} />
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


      {/* Post Actions */}
      <div className="post-actions">
        <LikeButton post={post} />
        <button className="action-btn">
          <FaRegComment /> {post.comments.length} Comment
        </button>
        <ShareButton post={post} />
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3 className="comments-title">Comments ({post.comments.length})</h3>

        <CommentForm postId={post._id} addComment={addComment} refreshPost={refreshPost} />

        <div className="comments-list">
          {post.comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <Comment key={comment._id} comment={comment} onDelete={handleDeleteComment} />
            ))
          )}
        </div>
      </div>
    </div>
    </div >
  );
}
