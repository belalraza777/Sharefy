import React, { useState, useCallback } from 'react';
import { MdDelete } from 'react-icons/md';
import './deletePostButton.css';
import usePostStore from '../../store/postStore';
import { useAuth } from '../../context/authContext';
import { toast } from 'sonner';

const DeletePostButton = ({ post }) => {
    // Get user from auth context
    const { user } = useAuth();

    // Get delete post function from post store
    const { deletePost } = usePostStore();

    // State to track loading state
    const [loading, setLoading] = useState(false);

    // Check ownership (derived value)
    const isOwner = user?.id === post.user._id;

    // Handle post deletion
    const handleDelete = useCallback(() => {
        toast("Are you sure you want to delete this post?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    setLoading(true);
                    try {
                        await deletePost(post._id);
                        toast.success('Post deleted successfully');
                    } catch (err) {
                        console.error('Error deleting post:', err);
                        toast.error('Error deleting post. Please try again.');
                    } finally {
                        setLoading(false);
                    }
                },
            },
        });
    }, [deletePost, post._id]);

    // ✅ Conditional render AFTER hooks
    if (!isOwner) return null;

    return (
        <button
            className="btn btn-danger option-item danger"
            onClick={handleDelete}
            disabled={loading}
        >
            <MdDelete />
            {/* Show loading text or delete text based on loading state */}
            {loading ? 'Deleting...' : 'Delete post'}
        </button>
    );
};

export default DeletePostButton;
