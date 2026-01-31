import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { useMemo, useCallback } from "react";
import usePostStore from "../../store/postStore";
import { useAuth } from "../../context/authContext";
import "./likeButton.css";

export default function LikeButton({ post }) {
  const { user } = useAuth(); // Get the current authenticated user
  //Store
  const { likePost, unlikePost, likingPostId } = usePostStore();

  // Check if the current user has liked the post in Memoized way
  const liked = useMemo(
    () => post.likes.includes(user?.id),
    [post.likes, user?.id]
  );

  // Number of likes in Memoized way
  const likesCount = useMemo(() => post.likes.length, [post.likes]);
  
  const loading = likingPostId === post._id;

  // Handle like/unlike action with useCallback which make the function memoized
  const handleLikeToggle = useCallback(async () => {
    if (loading || !user) return;
    liked ? await unlikePost(post._id) : await likePost(post._id);
  }, [loading, liked, post._id, likePost, unlikePost, user]);

  // Choose the appropriate icon based on like status
  const Icon = liked ? FcLike : FaRegHeart;

  return (
    <button
      onClick={handleLikeToggle}
      disabled={loading || !user}
      className={`like-button ${loading ? "loading" : ""}`}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      <Icon className={`like-icon ${liked ? "liked-icon" : "unliked-icon"}`} />

      <span className={`like-text ${likesCount > 0 ? "has-likes" : ""}`}>
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
