import './feed.css';
import React, { useEffect, useState, useCallback } from 'react';
import usePostStore from '../../store/postStore';
import { useAuth } from '../../context/authContext';
import FeedStories from './FeedStories';
import CreatePostBar from './CreatePostBar';
import FeedPosts from './FeedPosts';
import EmptyFeed from './EmptyFeed';
import SuggestedUsersMobile from '../../components/Discover/SuggestedUsersMobile';

export default function Feed() {
  const { user } = useAuth();
  const {posts, loading, getFeed} = usePostStore();
  const [page, setPage] = useState(1);

  // Initial feed load
  useEffect(() => {
    getFeed(1);
    setPage(1);
  }, [getFeed]);

// Fetch more posts for infinite scrolling
  const fetchMorePosts = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await getFeed(nextPage);
  }, [page, getFeed]);

  // Show empty feed state when no posts exist
  if (posts.length === 0 && !loading) {
    return <EmptyFeed user={user} />;
  }

  return (
    <div className="feed-container">
      <FeedStories />
      <CreatePostBar />
      <SuggestedUsersMobile />
      <FeedPosts posts={posts} fetchMorePosts={fetchMorePosts} />
    </div>
  );
}
