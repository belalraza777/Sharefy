// FeedPosts.jsx
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './post';
import { SkeletonPost } from '../../components/Skeleton/Skeleton';
import usePostStore from '../../store/postStore';

// Handles infinite scrolling and post rendering
export default function FeedPosts({ posts, fetchMorePosts }) {
  const { hasMore } = usePostStore();

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchMorePosts}
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
    >
      <div className="posts-feed">
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
