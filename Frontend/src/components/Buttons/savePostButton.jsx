import { useState, useEffect, useMemo, useCallback } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import useSavedPostStore from "../../store/savedPostStore";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";
import "./savePostButton.css";

export default function SavePostButton({ post }) {
    // Get user from auth context
    const { user } = useAuth();

    // Get save and unsave functions from saved post store
    const { savePost, unSavePost, savedPosts, ensureSavedPosts } =
        useSavedPostStore();

    // Loading state for button
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Fetch saved posts only once per session to avoid repeated network calls
            ensureSavedPosts();
        }
    }, [user, ensureSavedPosts]);

    // Check if the post is already saved by the user (derived state)
    const saved = useMemo(() => {
        if (!post || !user) return false;

        return savedPosts.some(
            (savedPost) => savedPost.post._id === post._id
        );
    }, [savedPosts, post, user]);

    // Handle save and unsave toggle button click
    const handleSaveToggle = useCallback(async () => {
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
    }, [loading, saved, post?._id, savePost, unSavePost]);

    return (
        <button
            onClick={handleSaveToggle}
            disabled={loading}
            className={`save-button ${loading ? "loading" : ""}`}
            aria-label={saved ? "Unsave post" : "Save post"}
        >
            {/* Show filled or empty bookmark icon based on saved state */}
            {saved ? (
                <BsBookmarkFill className="saved-icon" />
            ) : (
                <BsBookmark className="unsaved-icon" />
            )}
        </button>
    );
}
