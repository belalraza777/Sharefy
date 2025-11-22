import React, { useEffect } from 'react';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import { SkeletonStory } from '../Skeleton/Skeleton';
import './Story.css';

// StoryCircles
// Renders one circle per unique user in `stories`.
// Each circle points to the index of that user's first story.
// `hasUnseen` is true if any story for that user is not viewed.
// `onAddClick` optional handler for creating a new story.
const StoryCircles = ({ onAddClick }) => {
  const { user } = useAuth();
  const { stories, fetchStories, loading, error, openViewer } = useStoryStore();

  // Fetch on initial mount if we have no stories yet.
  useEffect(() => { if (!stories.length) fetchStories(); }, [stories.length, fetchStories]);

  // Build unique user circles in one pass (O(n)).
  // pos keeps the index of the circle for a user so we can update its unseen state.
  const circles = [];  // final list rendered
  const pos = {};      // maps userId -> index in circles
  // Iterate each story once:
  // 1. Determine the owning user id.
  // 2. If first time seeing this user, create a circle pointing to this story index.
  // 3. If user already has a circle and current story is unseen, flip hasUnseen to true.
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    const u = s.user; // may be populated object or string id
    const id = u?._id || (typeof u === 'string' ? u : null);
    if (!id) continue; // skip malformed entries
    if (pos[id] === undefined) {
      // First story encountered for this user -> create circle
      pos[id] = circles.length;
      circles.push({ user: u, startIndex: i, hasUnseen: !s.hasViewed });
    } else if (!s.hasViewed) {
      // Another story for this user that is unseen -> mark circle unseen
      circles[pos[id]].hasUnseen = true;
    }
  }

  return (
    <div className="story-bar-wrapper">
      {error && (
        <div className="story-error">
          <span>{error}</span>
          <button onClick={fetchStories}>Retry</button>
        </div>
      )}
      <div className="story-bar">
        <div className="story-circle add" onClick={onAddClick} title="Add Story">
          <div className="add-inner">+</div>
          <span className="story-username">{user?.username || 'You'}</span>
        </div>
        {loading && !circles.length && (
          <>
            <SkeletonStory />
            <SkeletonStory />
            <SkeletonStory />
            <SkeletonStory />
            <SkeletonStory />
          </>
        )}
        {circles.map((c, i) => (
          <div
            key={c.user?._id || i}
            className={`story-circle ${c.hasUnseen ? 'unviewed' : 'viewed'}`}
            // Open viewer at this user's first story index
            onClick={() => openViewer(c.startIndex)}
            title={c.user?.username}
          >
            <div className="story-avatar-wrap">
              <img
                src={c.user?.profileImage || '/default-avatar.png'}
                alt={c.user?.username || 'story'}
                className="story-avatar"
                loading="lazy"
              />
            </div>
            <span className="story-username">{c.user?.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCircles;