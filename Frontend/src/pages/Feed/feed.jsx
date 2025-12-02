import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import usePostStore from '../../store/postStore';
import Post from './post';
import { SkeletonPost } from '../../components/Skeleton/Skeleton';
import './feed.css';
// Story components
import StoryCircles from '../../components/Story/StoryCircles';
import StoryViewer from '../../components/Story/StoryViewer';
import CreateStory from '../../components/Story/CreateStory';
import { useAuth } from '../../context/authContext';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoImagesOutline } from 'react-icons/io5';
import { CiVideoOn } from 'react-icons/ci';


export default function Feed() {
  const { user } = useAuth();
  const { posts, getFeed, hasMore, loading } = usePostStore();
  const [page, setPage] = useState(1);
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Lock body scroll when create story modal open
  useEffect(() => {
    if (showCreateStory) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showCreateStory]);


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
      <>
        <div className="empty-feed">
          <div className="empty-icon">📱</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
          <Link to="/new-post" className="create-first-post-btn">
            Create Your First Post
          </Link>
        </div>

        {/* Create Post Bar - quick entry below stories */}
        <div className="create-post-bar">
          <div className="create-post-bar__left">
            <div className="create-post-bar__avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.username} />
              ) : (
                <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <Link to="/new-post" className="create-post-bar__placeholder">
              What's on your mind, {user?.username || 'there'}?
            </Link>
          </div>
          <div className="create-post-bar__actions">
            <Link to="/new-post" className="create-post-bar__action" aria-label="Add photo">
              <IoImagesOutline />
            </Link>
            <Link to="/new-post" className="create-post-bar__action" aria-label="Add video">
              <CiVideoOn />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="feed-container">
      {/* Stories Bar */}
      <div className="feed-stories-section">
        <StoryCircles onAddClick={() => setShowCreateStory(true)} />
        {showCreateStory && createPortal(
          <div className="story-create-overlay" onClick={() => setShowCreateStory(false)}>
            <div className="story-create-modal" onClick={(e) => e.stopPropagation()}>
              <CreateStory
                onSuccess={() => setShowCreateStory(false)}
                onClose={() => setShowCreateStory(false)}
              />
            </div>
          </div>,
          document.body
        )}
        <StoryViewer />
      </div>
      {/* Create Post Bar - quick entry below stories (visible in main feed) */}
      <div className="create-post-bar">
        <div className="create-post-bar__left">
          <div className="create-post-bar__avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} />
            ) : (
              <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <Link to="/new-post" className="create-post-bar__placeholder">
            What's on your mind, {user?.username || 'there'}?
          </Link>
        </div>
        <div className="create-post-bar__actions">
          <Link to="/new-post" className="create-post-bar__action" aria-label="Add photo">
            <IoImagesOutline />
          </Link>
          <Link to="/new-post" className="create-post-bar__action" aria-label="Add video">
            <CiVideoOn />
          </Link>
        </div>
      </div>
      {/* Create Post Prompt */}
      {/* <div className="create-post-prompt">
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
      </div> */}

      {/* Infinite Scroll Posts Feed */}
      <InfiniteScroll
        dataLength={posts.length} // This is important field to render the next data
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="infinite-scroll-loader">
            <SkeletonPost />
            <SkeletonPost />
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