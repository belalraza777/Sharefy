import { useState, useCallback } from "react";
import { TbShare3 } from "react-icons/tb";
import { toast } from "sonner";
import "./shareButton.css";

export default function ShareButton({ post }) {
  const [loading, setLoading] = useState(false);

  const handleShare = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const postUrl = `${window.location.origin}/post/${post._id}`;

    try {
      // Check if native share is available (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `Post by @${post.user.username}`,
          text: post.caption || "Check out this post on Sharefy!",
          url: postUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      // User cancelled the share or error occurred
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
        toast.error("Failed to share");
      }
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    post._id,
    post.user.username,
    post.caption
  ]);

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={`share-button ${loading ? "loading" : ""}`}
      aria-label="Share post"
    >
      <TbShare3 />
    </button>
  );
}
