import React, { useState } from 'react';
import { toast } from 'sonner';
import './singlePost.css';

export default function CommentForm({ postId, addComment, refreshPost }) {
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsLoading(true);
    try {
      await addComment(postId, { text: commentText });
      setCommentText('');
      await refreshPost();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddComment} className="add-comment-form">
      <div className="comment-input-container">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={isLoading || !commentText.trim()}
        >
          {isLoading ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
