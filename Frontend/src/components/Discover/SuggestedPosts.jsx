import React, { useEffect } from 'react';
import useDiscoverStore from '../../store/discoverStore';
import { SkeletonPost } from '../../components/Skeleton/Skeleton';
import './Suggested.css';

const SuggestedPosts = ({ limit = 6 }) => {
  const { suggestedPosts, fetchSuggestedPosts, loadingPosts } = useDiscoverStore();

  useEffect(() => {
    fetchSuggestedPosts(limit);
  }, [limit]);

  if (loadingPosts) {
    return (
      <div className="suggested-block">
        <h4 className="suggested-title">Suggested posts</h4>
        <div className="suggested-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!suggestedPosts || suggestedPosts.length === 0) return null;

  return (
    <div className="suggested-block">
      <h4 className="suggested-title">Suggested posts</h4>
      <ul className="suggested-posts-list">
        {suggestedPosts.map((p) => (
          <li key={p._id} className="suggested-post-item">
            <a href={`#/post/${p._id}`} className="post-thumb">
              {p.media?.type === 'image' ? (
                <img src={p.media?.url} alt={p.caption || 'Post image'} />
              ) : (
                <video src={p.media?.url} muted preload="metadata" />
              )}
            </a>
            <div className="post-meta">
              <div className="post-author">@{p.user?.username || p.author?.username}</div>
              <div className="post-caption">{p.caption ? (p.caption.length > 60 ? p.caption.slice(0, 60) + '...' : p.caption) : ''}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedPosts;
