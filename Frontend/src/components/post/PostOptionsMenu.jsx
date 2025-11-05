import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { FaRegCopy, FaExternalLinkAlt, FaFlag, FaUserTimes, FaShareAlt, FaUserPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { toast } from 'sonner';
import usePostStore from '../../store/postStore';
import useUserStore from '../../store/userStore';
import './PostOptionsMenu.css';

export default function PostOptionsMenu({ post, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deletePost } = usePostStore();
  const { followUser, unfollowUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwner = user?.id === post.user._id;

  // Check if current user is following the post author
  useEffect(() => {
    if (user?.following && post.user._id) {
      const following = user.following.some(
        follow => follow.following === post.user._id
      );
      setIsFollowing(following);
    }
  }, [user, post.user._id]);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success('Link copied to clipboard!');
    if (onClose) onClose();
  };

  const handleGoToPost = () => {
    navigate(`/post/${post._id}`);
    if (onClose) onClose();
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username}`,
          text: post.caption || 'Check out this post!',
          url: postUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
    if (onClose) onClose();
  };

  const handleReport = () => {
    toast.info('Report feature coming soon');
    if (onClose) onClose();
  };

  const handleFollowToggle = async () => {
    if (followLoading) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(post.user._id);
        setIsFollowing(false);
        toast.success(`Unfollowed @${post.user.username}`);
      } else {
        await followUser(post.user._id);
        setIsFollowing(true);
        toast.success(`Following @${post.user.username}`);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
    if (onClose) onClose();
  };

  const handleDelete = async () => {
    toast("Are you sure you want to delete this post?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setLoading(true);
          try {
            await deletePost(post._id);
            toast.success('Post deleted successfully');
            if (onClose) onClose();
            // Navigate to home if we're on the single post page
            if (window.location.pathname.includes('/post/')) {
              navigate('/');
            }
          } catch (err) {
            console.error('Error deleting post:', err);
            toast.error('Error deleting post. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    });
  };

  return (
    <div className="post-options-menu">
      <button className="option-item" onClick={handleGoToPost}>
        <FaExternalLinkAlt /> Go to post
      </button>
      <button className="option-item" onClick={handleCopyLink}>
        <FaRegCopy /> Copy link
      </button>
      <button className="option-item" onClick={handleShare}>
        <FaShareAlt /> Share
      </button>
      
      {!isOwner && (
        <>
          <div className="option-divider"></div>
          <button 
            className="option-item" 
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {isFollowing ? (
              <>
                <FaUserTimes /> Unfollow @{post.user.username}
              </>
            ) : (
              <>
                <FaUserPlus /> Follow @{post.user.username}
              </>
            )}
          </button>
          <button className="option-item danger" onClick={handleReport}>
            <FaFlag /> Report
          </button>
        </>
      )}
      
      {isOwner && (
        <>
          <div className="option-divider"></div>
          <button 
            className="option-item danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            <MdDelete />
            {loading ? 'Deleting...' : 'Delete post'}
          </button>
        </>
      )}
    </div>
  );
}
