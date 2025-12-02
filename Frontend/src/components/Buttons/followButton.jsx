import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import useUserStore from '../../store/userStore.js';
import { toast } from 'sonner';
import './followButton.css';

const FollowButton = ({ userId }) => {
    // Get current user from auth context
    const { user: currentUser } = useAuth();
    // Get follow/unfollow functions from store
    const { followUser, unfollowUser } = useUserStore();
    
    // State for button
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Don't show button if it's user's own profile
    const isOwnProfile = currentUser?._id === userId;
    if (isOwnProfile) return null;

    // Check if current user is already following this user
    useEffect(() => {
        if (currentUser?.following && userId) {
            // Look through following list to see if userId is there
            const following = currentUser.following.some(
                follow => follow.following === userId
            );
            setIsFollowing(following);
        }
    }, [currentUser, userId]);

    const { refreshUser } = useAuth();

    // Handle follow/unfollow button click
    const handleFollow = async () => {
        if (loading) return; // Prevent multiple clicks
        
        setLoading(true);
        try {
            if (isFollowing) {
                // If already following, unfollow
                await unfollowUser(userId);
                setIsFollowing(false);
                toast.success('User unfollowed');
                // Refresh auth user so other components react to the change
                try { await refreshUser(); } catch (e) { /* ignore */ }
            } else {
                // If not following, follow
                await followUser(userId);
                setIsFollowing(true);
                toast.success('User followed');
                // Refresh auth user so other components react to the change
                try { await refreshUser(); } catch (e) { /* ignore */ }
            }
            
        } catch (error) {
            console.error('Follow error:', error);
            toast.error('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Show loading dots when processing
    if (loading) {
        return (
            <button className="follow-btn loading" disabled>
                ...
            </button>
        );
    }

    // Show "Following" or "Follow" based on current state
    return (
        <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;