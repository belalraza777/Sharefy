// EmptyFeed.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import CreatePostBar from './CreatePostBar';

// Shown when feed has no posts yet
export default function EmptyFeed({ user }) {
  return (
    <>
      <div className="empty-feed">
        <div className="empty-icon">📱</div>
        <h3>No posts yet</h3>
        <p>Be the first to share something!</p>

        <Link to="/new-post" className="create-first-post-btn">
          Create Your First Post
        </Link>
      </div>

      <CreatePostBar user={user} />
    </>
  );
}
