import { useState, useEffect } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import useSavedPostStore from "../../store/savedPostStore";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";
import "./savePostButton.css";

export default function SavePostButton({ post }) {
    // Get user from auth context
    const { user } = useAuth();
    // Get save and unsave functions from saved post store
    const { savePost, unSavePost, savedPosts, getSavedPosts } = useSavedPostStore();

    // State to track if the post is saved
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            getSavedPosts(); // Fetch saved posts from backend
        }
    }, [user, getSavedPosts]);

    // Check if the post is already saved by the user
    useEffect(() => {
        if (post && user) {
            setSaved(savedPosts.some((savedPost) => savedPost.post._id === post._id));
        }
    }, [savedPosts, post, user]);

    console.log("Saved posts:", savedPosts);
    

    // Handle save and unsave toggle
    const handleSaveToggle = async () => {
        if (loading) return;
        setLoading(true);

        try {
            if (saved) {
                await unSavePost(post._id);
                toast.success("Post unsaved");
            } else {
                await savePost(post._id);
                toast.success("Post saved");
            }
        } catch (error) {
            console.error("Save action failed:", error);
            toast.error("Failed to update save status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSaveToggle}
            disabled={loading}
            className={`save-button ${loading ? "loading" : ""}`}
            aria-label={saved ? "Unsave post" : "Save post"}
        >
            {/* Show filled or empty bookmark icon based on saved state */}
            {saved ? <BsBookmarkFill className="saved-icon" /> : <BsBookmark className="unsaved-icon" />}
        </button>
    );
}
