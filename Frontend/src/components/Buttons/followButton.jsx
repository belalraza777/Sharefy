import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import useUserStore from '../../store/userStore.js';
import { toast } from 'sonner';
import './followButton.css';

const FollowButton = ({ userId }) => {
    // Get current user from auth context
    const { user: currentUser, refreshUser } = useAuth();

    // Get follow/unfollow functions from store
    const { followUser, unfollowUser } = useUserStore();

    // Loading state for button
    const [loading, setLoading] = useState(false);

    // Is this the user's own profile?
    const isOwnProfile = currentUser?._id === userId;

    // Check if current user is already following this user (derived state)
    const isFollowing = useMemo(() => {
        if (!currentUser?.following || !userId) return false;

        // Look through following list to see if userId is there
        return currentUser.following.some(
            follow => follow.following === userId
        );
    }, [currentUser?.following, userId]);

    // Handle follow/unfollow button click
    const handleFollow = useCallback(async () => {
        if (loading) return; // Prevent multiple clicks

        setLoading(true);
        try {
            if (isFollowing) {
                // If already following, unfollow
                await unfollowUser(userId);
                toast.success('User unfollowed');
            } else {
                // If not following, follow
                await followUser(userId);
                toast.success('User followed');
            }

            // Refresh auth user so other components react to the change
            try {
                await refreshUser();
            } catch {
                /* ignore refresh errors */
            }

        } catch (error) {
            console.error('Follow error:', error);
            toast.error('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    }, [
        loading,
        isFollowing,
        userId,
        followUser,
        unfollowUser,
        refreshUser
    ]);

    // ✅ Conditional render AFTER hooks
    if (isOwnProfile) return null;

    return (
        <button
            className={`follow-btn ${isFollowing ? 'following' : ''} ${loading ? 'loading' : ''}`}
            onClick={handleFollow}
            disabled={loading}
        >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;
