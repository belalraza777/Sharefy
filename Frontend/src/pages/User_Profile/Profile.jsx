import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import useUserStore from '../../store/userStore.js';
import './Profile.css';
import FollowButton from '../../components/Buttons/followButton.jsx';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { FaHeart, FaComment } from 'react-icons/fa';
import { MdOutlineGridOn } from 'react-icons/md';
import { FiBookmark, FiSettings } from 'react-icons/fi';
import SavedPost from '../../pages/SavedPost/SavedPost';




export default function Profile() {

    // Get username from URL and current user from auth
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { profile, getUserProfile } = useUserStore();

    // State for active tab (posts or saved)
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);

    // Check if this is current user's own profile
    const isOwnProfile = currentUser?.username === username;

    // Load profile data when username changes
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            await getUserProfile(username);
            setLoading(false);
        };
        loadProfile();
    }, [username]);

    // Navigate to post page when post is clicked
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    // Show loading spinner
    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
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
    const followersCount = user.followers?.length || 0; // Number of followers
    const followingCount = user.following?.length || 0; // Number of people user follows

    return (
        <div className="profile-container">
            {/* Profile Header Section */}
            <div className="profile-header">
                {/* Profile Picture */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar">
                        <img
                            src={user?.profileImage || defaultAvatar}
                            alt={user.username}
                            onError={(e) => {
                                e.target.src = defaultAvatar; // Fallback image
                            }}
                        />
                    </div>
                </div>

                {/* Profile Information */}
                <div className="profile-info">
                    <div className="profile-top">
                        <h1 className="username">@{user.username}</h1>

                        {/* Show edit buttons for own profile, follow button for others */}
                        {isOwnProfile ? (
                            <div className="profile-actions">
                                <button className="edit-profile-btn" onClick={() => navigate('/settings')}>
                                    Edit Profile
                                </button>
                                <button className="settings-btn" onClick={() => navigate('/settings')}>
                                    <FiSettings />
                                </button>
                            </div>
                        ) : (
                            <div className="profile-actions">
                                <FollowButton
                                    userId={user._id}
                                />
                                <button className="message-btn">
                                    Message
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Stats */}
                    <div className="profile-stats">
                        <div className="stat">
                            <strong>{postsCount}</strong>
                            <span>posts</span>
                        </div>
                        <div className="stat">
                            <strong>{followersCount}</strong>
                            <span>followers</span>
                        </div>
                        <div className="stat">
                            <strong>{followingCount}</strong>
                            <span>following</span>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="profile-details">
                        <h2 className="full-name">{user.fullName}</h2>
                        {user.bio && <p className="bio">{user.bio}</p>}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="profile-tabs">
                <button
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <MdOutlineGridOn /> Posts
                </button>

                {/* Only show saved tab for own profile */}
                {isOwnProfile && (
                    <button
                        className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        <FiBookmark /> Saved
                    </button>
                )}
            </div>

            {/* Posts Grid */}
            <div className="profile-posts">
                {activeTab === 'posts' && (
                    <>
                        {/* Show message if no posts */}
                        {userPosts.length === 0 ? (
                            <div className="no-posts">
                                <div className="no-posts-icon">📷</div>
                                <h3>No Posts Yet</h3>
                                {isOwnProfile && (
                                    <p>Share your first photo or video!</p>
                                )}
                            </div>
                        ) : (
                            /* Show posts grid */
                            <div className="posts-grid">
                                {userPosts.map(post => (
                                    <div
                                        key={post._id}
                                        className="post-thumbnail"
                                        onClick={() => handlePostClick(post._id)}
                                    >
                                        {/* Show image or video */}
                                        {post.media.type === 'video' ? (
                                            <video src={post.media.url} muted />
                                        ) : (
                                            <img src={post.media.url} alt={post.caption} />
                                        )}
                                        {/* Show likes/comments on hover */}
                                        <div className="post-overlay">
                                            <span><FaHeart />
                                                {post.likes?.length || 0}</span>
                                            <span><FaComment />
                                                {post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Saved posts tab (only for own profile) */}
                {activeTab === 'saved' && isOwnProfile && (
                    <div className="saved-posts">
                        <SavedPost />
                    </div>
                )}
            </div>
        </div>
    );
}