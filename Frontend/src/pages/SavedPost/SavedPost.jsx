import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSavedPostStore from "../../store/savedPostStore";
import { FaHeart, FaComment } from 'react-icons/fa';

export default function SavedPost() {
    const navigate = useNavigate();
    const { savedPosts, getSavedPosts, loading, error } = useSavedPostStore();

    useEffect(() => {
        getSavedPosts();
    }, [getSavedPosts]);

    const handlePostClick = (postId) => {
        console.log("Clicked post:", postId);
        navigate(`/post/${postId}`);
    };

    return (
        <div>
            <h1>Saved Posts</h1>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {savedPosts.length === 0 ? (
                <p>No saved posts yet.</p>
            ) : (
                <div className="posts-grid">
                    {savedPosts.map((post) => (
                        <div
                            key={post.post._id}
                            className="post-thumbnail"
                            onClick={() => handlePostClick(post.post._id)}
                        >
                            {/* Show image or video */}
                            {post.post.media?.type === "video" ? (
                                <video src={post.post.media.url} muted />
                            ) : (
                                <img src={post.post.media?.url} alt={post.caption || "Post"} />
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
