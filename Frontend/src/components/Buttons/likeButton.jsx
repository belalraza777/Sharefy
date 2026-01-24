import { useState, useEffect } from "react";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import usePostStore from "../../store/postStore";
import { useAuth } from "../../context/authContext";
import "./likeButton.css"; // import CSS file

export default function LikeButton({ post }) {
  // Get user from auth context
  const { user } = useAuth();
  // Get like and unlike functions from post store
  const { likePost, unlikePost } = usePostStore();

  // State to track if the post is liked
  const [liked, setLiked] = useState(false);
  // State to track the number of likes
  const [likes, setLikes] = useState(0);
  // State to track loading state
  const [loading, setLoading] = useState(false);

  // Check if the post is already liked by the user and set the number of likes
  useEffect(() => {
    if (post && user) {
      setLiked(post?.likes?.includes(user.id));
      setLikes(post?.likes?.length);
    }
  }, [post, user]);

  // Handle like and unlike toggle
  const handleLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        await unlikePost(post._id);
        setLiked(false);
        setLikes(prev => prev - 1);
      } else {
        await likePost(post._id);
        setLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error("Like action failed:", error);
      toast.error("Failed to update like status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={loading}
      className={`like-button ${loading ? "loading" : ""}`}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      {/* Show filled or empty heart icon based on liked state */}
      {liked ? <FcLike className="liked-icon" /> : <FaRegHeart className="unliked-icon" />}
      <span className="like-text">
        {likes} {likes === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
