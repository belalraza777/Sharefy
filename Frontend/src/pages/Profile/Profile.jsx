import './Profile.css';
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import useUserStore from '../../store/userStore.js';
import Skeleton from '../../components/Skeleton/Skeleton.jsx';
import FollowListModal from '../../components/FollowList/FollowListModal.jsx';
import ProfileHeader from '../../components/Profile/ProfileHeader.jsx';
import ProfileTabs from '../../components/Profile/ProfileTabs.jsx';
import ProfilePosts from '../../components/Profile/ProfilePosts.jsx';


export default function Profile() {

    // Get username from URL and current user from auth
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const {
        profile,
        getUserProfile,
        followers,
        following,
        getFollowers,
        getFollowing,
        resetFollowers,
        resetFollowing
    } = useUserStore();

    // Extract followers/following data and loading states
    const followersItems = followers.items || [];
    const followingItems = following.items || [];
    const followersPage = followers.page || 1;
    const followingPage = following.page || 1;
    const followersHasMore = Boolean(followers.hasMore);
    const followingHasMore = Boolean(following.hasMore);
    const followersLoading = Boolean(followers.loading);
    const followingLoading = Boolean(following.loading);
    const followersError = followers.error;
    const followingError = following.error;

    // State for active tab (posts or saved)
    const [activeTab, setActiveTab] = useState('posts');
    const [activeList, setActiveList] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if this is current user's own profile
    const isOwnProfile = currentUser?.username === username;
    const FOLLOW_PAGE_SIZE = 20;
    const profileUserId = profile?.user?._id;

    // Load profile data when username changes
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            await getUserProfile(username);
            setLoading(false);
        };
        loadProfile();
    }, [username, currentUser]);

    useEffect(() => {
        resetFollowers();
        resetFollowing();
    }, [username, resetFollowers, resetFollowing]);

    useEffect(() => {
        if (!isOwnProfile || !profileUserId) return;

        if (activeList === 'followers' && followersItems.length === 0 && !followersLoading) {
            getFollowers(profileUserId, { page: 1, limit: FOLLOW_PAGE_SIZE });
        }

        if (activeList === 'following' && followingItems.length === 0 && !followingLoading) {
            getFollowing(profileUserId, { page: 1, limit: FOLLOW_PAGE_SIZE });
        }
    }, [
        activeList,
        isOwnProfile,
        profileUserId,
        followersItems.length,
        followingItems.length,
        followersLoading,
        followingLoading,
        getFollowers,
        getFollowing
    ]);

    // Navigate to post page when post is clicked
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    // Show loading spinner
    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-skeleton">
                    <div style={{ display: 'flex', gap: '24px', padding: '24px', alignItems: 'center' }}>
                        <Skeleton variant="circle" width="150px" height="150px" />
                        <div style={{ flex: 1 }}>
                            <Skeleton variant="text" width="200px" height="24px" />
                            <Skeleton variant="text" width="150px" height="16px" />
                            <Skeleton variant="text" width="300px" height="14px" count={2} />
                        </div>
                    </div>
                    <div style={{ padding: '0 24px' }}>
                        <Skeleton variant="rect" width="100%" height="300px" count={3} />
                    </div>
                </div>
            </div>
        );
    }

    // Show error if profile not found
    if (!profile) {
        return (
            <div className="profile-error">
                <div className="error-icon">😕</div>
                <h3>Profile Not Found</h3>
                <p>User @{username} doesn't exist.</p>
            </div>
        );
    }

    const { user, posts: userPosts = [] } = profile;

    // Calculate counts for profile stats
    const postsCount = userPosts.length;
    const followersCount = (profile.followersCount ?? user.followers?.length) || 0;
    const followingCount = (profile.followingCount ?? user.following?.length) || 0;

    const handleLoadMoreFollowers = () => {
        if (!user?._id || followersLoading || !followersHasMore) return;
        getFollowers(user._id, { page: followersPage + 1, limit: FOLLOW_PAGE_SIZE });
    };

    const handleLoadMoreFollowing = () => {
        if (!user?._id || followingLoading || !followingHasMore) return;
        getFollowing(user._id, { page: followingPage + 1, limit: FOLLOW_PAGE_SIZE });
    };

    const openList = (type) => {
        if (!isOwnProfile) return;
        setActiveList(type);
    };

    const closeList = () => setActiveList(null);

    return (
        <div className="profile-container">
            {/* Render profile header with user info and stats */}
            <ProfileHeader
                user={user}
                isOwnProfile={isOwnProfile}
                postsCount={postsCount}
                followersCount={followersCount}
                followingCount={followingCount}
                activeList={activeList}
                onOpenList={openList}
                onEditProfile={() => navigate('/settings')}
                onOpenSettings={() => navigate('/settings')}
            />

            {/* Render tabs for posts/saved */}
            <ProfileTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                isOwnProfile={isOwnProfile}
            />
            {/* Render posts or saved posts based on active tab */}
            <ProfilePosts
                activeTab={activeTab}
                userPosts={userPosts}
                isOwnProfile={isOwnProfile}
                onPostClick={handlePostClick}
            />
            {/* Render follow list modal if own profile and a list is active */}
            {isOwnProfile && (
                <FollowListModal
                    activeList={activeList}
                    isOpen={Boolean(activeList)}
                    followers={followersItems}
                    following={followingItems}
                    followersLoading={followersLoading}
                    followingLoading={followingLoading}
                    followersError={followersError}
                    followingError={followingError}
                    followersHasMore={followersHasMore}
                    followingHasMore={followingHasMore}
                    onLoadMoreFollowers={handleLoadMoreFollowers}
                    onLoadMoreFollowing={handleLoadMoreFollowing}
                    onClose={closeList}
                />
            )}
        </div>
    );
}