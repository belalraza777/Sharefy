// Feed.jsx
import './Feed.css';
import React, { useEffect, useState } from 'react';
import usePostStore from '../../store/postStore';
import { useAuth } from '../../context/authContext';
import FeedStories from './FeedStories';
import CreatePostBar from './CreatePostBar';
import FeedPosts from './FeedPosts';
import EmptyFeed from './EmptyFeed';
import SuggestedUsersMobile from '../../components/Discover/SuggestedUsersMobile';

export default function Feed() {
  const { user } = useAuth();
  const { posts, getFeed, loading } = usePostStore();
  const [page, setPage] = useState(1); 

  // Load first page of feed posts on mount
  useEffect(() => {
    getFeed(1);
  }, [getFeed]);

  // Fetch next page for infinite scroll
  const fetchMorePosts = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await getFeed(nextPage);
  };

  // Show empty feed state when no posts exist
  if (posts.length === 0 && !loading) {
    return <EmptyFeed user={user} />;
  }

  return (
    <div className="feed-container">
      <FeedStories />
      <CreatePostBar user={user} />
      <SuggestedUsersMobile />
      <FeedPosts posts={posts} fetchMorePosts={fetchMorePosts} />
    </div>
  );
}
