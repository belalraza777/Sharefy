import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usePostStore from '../../store/postStore';
import useCommentStore from '../../store/commentStore';
import LikeButton from '../../components/Buttons/likeButton';
import { FaRegComment, FaShare } from 'react-icons/fa';
import defaultAvatar from '../../assets/defaultAvatar.png';
import Comment from './comment';
import CommentForm from './commentForm';
import './singlePost.css';
import { useState } from 'react';
import DeletePostButton from '../../components/Buttons/deletePostButton';


export default function SinglePost() {
  const { postId } = useParams();
  const { getPostById, post } = usePostStore();
  const { addComment, deleteComment } = useCommentStore();
  const [moreOpen, setMoreOpen] = useState(false);
  
  console.log(post);
  

  useEffect(() => {
    getPostById(postId);
  }, [postId, getPostById]);

  if (!post) return <div className="loading-container"><p>Loading post...</p></div>;

  const refreshPost = () => getPostById(postId);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      await refreshPost();
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen);
  };

  return (
    <div className="single-post-container">
      <div className="post-card">
        {/* Post Header */}
        <div className="post-header">
          <div className="post-user">
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


      {/* Post Actions */}
      <div className="post-actions">
        <LikeButton post={post} />
        <button className="action-btn">
          <FaRegComment /> {post.comments.length} Comment
        </button>
        <button className="action-btn">
          <FaShare /> Share
        </button>
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
