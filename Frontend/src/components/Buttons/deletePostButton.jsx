import React from 'react';
import { MdDelete } from 'react-icons/md';
import usePostStore from '../../store/postStore';
import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { toast } from 'sonner';

const DeletePostButton = ({ post }) => {
    // Get user from auth context
    const { user } = useAuth();
    // Get delete post function from post store
    const { deletePost } = usePostStore();
    // State to track loading state
    const [loading, setLoading] = useState(false);

    // Only show delete button if user is the post owner
    if (user.id !== post.user._id) {
        return null;
    }

    // Handle post deletion
    const handleDelete = async () => {
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
    };

    return (
        <button
            className='btn btn-danger option-item danger'
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