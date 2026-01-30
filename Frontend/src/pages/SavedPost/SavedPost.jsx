import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSavedPostStore from "../../store/savedPostStore";
import { FaHeart, FaComment } from 'react-icons/fa';
import Skeleton from '../../components/Skeleton/Skeleton';
import './SavedPost.css';

export default function SavedPost() {
    const navigate = useNavigate();
    const { savedPosts, getSavedPosts, loading, error } = useSavedPostStore();

    useEffect(() => {
        getSavedPosts();
    }, []);

    const handlePostClick = (postId) => {
        console.log("Clicked post:", postId);
        navigate(`/post/${postId}`);
    };

    return (
        <div className="savedpost-container">
            <h1 className="savedpost-title">Saved Posts</h1>

            {loading && (
                <div className="savedpost-grid">
                    <Skeleton variant="rect" width="100%" height="300px" />
                    <Skeleton variant="rect" width="100%" height="300px" />
                    <Skeleton variant="rect" width="100%" height="300px" />
                    <Skeleton variant="rect" width="100%" height="300px" />
                </div>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {savedPosts.length === 0 ? (
                <p className="savedpost-empty">No saved posts yet.</p>
            ) : (
                <div className="savedpost-grid">
                    {savedPosts.map((post) => (
                        <div
                            key={post.post._id}
                            className="savedpost-card"
                            onClick={() => handlePostClick(post.post._id)}
                        >
                            {/* Show image or video */}
                            {post.post.media?.type === "video" ? (
                                <video className="savedpost-card-image" src={post.post.media.url} muted />
                            ) : (
                                <img className="savedpost-card-image" src={post.post.media?.url} alt={post.caption || "Post"} />
                            )}

                            {/* Overlay on hover */}
                            <div className="post-overlay">
                                <span><FaHeart />
                                    {post.post.likes?.length || 0}</span>
                                <span><FaComment />
                                    {post.post.comments?.length || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
