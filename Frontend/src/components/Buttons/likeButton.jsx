import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import usePostStore from "../../store/postStore";
import { useAuth } from "../../context/authContext";
import "./likeButton.css";

export default function LikeButton({ post }) {
  const { user } = useAuth();

  // Zustand store
  const { likePost, unlikePost, likingPostId } = usePostStore();

  // Is this post liked by current user?
  const liked = post.likes.includes(user.id);

  // Number of likes
  const likesCount = post.likes.length;

  // Loading state for this specific post
  const loading = likingPostId === post._id;

  // Toggle like/unlike
  const handleLikeToggle = async () => {
    if (loading) return; // prevent double click

    if (liked) {
      await unlikePost(post._id);
    } else {
      await likePost(post._id);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={loading}
      className={`like-button ${loading ? "loading" : ""}`}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      {/* Heart icon */}
      {liked ? (
        <FcLike className="like-icon liked-icon" />
      ) : (
        <FaRegHeart className="like-icon unliked-icon" />
      )}

      {/* Likes count */}
      <span className={`like-text ${likesCount > 0 ? "has-likes" : ""}`}>
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
