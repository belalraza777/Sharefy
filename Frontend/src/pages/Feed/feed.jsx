import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import usePostStore from '../../store/postStore';
import Post from './post';
import './Feed.css';
import { useAuth } from '../../context/authContext';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoImagesOutline } from 'react-icons/io5';
import { CiVideoOn } from 'react-icons/ci';


export default function Feed() {
  const { user } = useAuth();
  const { posts, getFeed, hasMore, loading } = usePostStore();
  const [page, setPage] = useState(1);


  // Initial load
  useEffect(() => {
    getFeed(1); // Load first page
  }, [getFeed]);

  // Load more posts when scrolling
  const fetchMoreData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await getFeed(nextPage);
  };

  if (posts.length === 0 && !loading) {
    return (
      <div className="empty-feed">
        <div className="empty-icon">📱</div>
        <h3>No posts yet</h3>
        <p>Be the first to share something!</p>
        <Link to="/new-post" className="create-first-post-btn">
          Create Your First Post
        </Link>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* Create Post Prompt */}
      <div className="create-post-prompt">
        <div className="prompt-content">
          <div >
            <img src={user.profileImage} alt={user.username} className="user-avatar" />
          </div>
          <Link to="/new-post" className="post-prompt-input">
            What's on your mind, {user.username} ?
          </Link>
        </div>
        <div className="prompt-actions">
          <Link to="/new-post" className="prompt-action">
            <span className="action-icon"><IoImagesOutline /></span>
            <span className="action-text">Photo</span>
          </Link>
          <Link to="/new-post" className="prompt-action">
            <span className="action-icon"><CiVideoOn /></span>
            <span className="action-text">Video</span>
          </Link>
        </div>
      </div>

      {/* Infinite Scroll Posts Feed */}
      <InfiniteScroll
        dataLength={posts.length} // This is important field to render the next data
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="infinite-scroll-loader">
            <div className="loading-spinner"></div>
            <p>Loading more posts...</p>
          </div>
        }
        endMessage={
          <div className="infinite-scroll-end">
            <p>🎉 You've seen all posts!</p>
          </div>
        }
        refreshFunction={fetchMoreData}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        pullDownToRefreshContent={
          <p style={{ textAlign: 'center' }}>⬇️ Pull down to refresh</p>
        }
        releaseToRefreshContent={
          <p style={{ textAlign: 'center' }}>⬆️ Release to refresh</p>
        }
      >
        <div className="posts-feed">
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      </InfiniteScroll>

      {/* Floating Action Button for Mobile */}
      <Link to="/new-post" className="floating-create-btn">
        <span className="plus-icon"><IoIosAddCircleOutline /></span>
      </Link>
    </div>
  );
}