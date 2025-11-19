// StoryCircles: one circle per user with a story.
// Data comes from the flat `stories` list in the store.
// We derive lightweight groups (user -> first story index, hasUnseen) with useMemo.
import React, { useEffect, useMemo } from 'react';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import './Story.css';

// Horizontal story bar: shows current user's add button then followed + own stories.
// Unviewed story: gradient ring; viewed: neutral gray ring.
// Clicking a story opens viewer via store.openViewer(index).
// Add button triggers optional external handler (passed as prop) or noop for now.

// Props:
// onAddClick: optional handler to open a create story modal.
const StoryCircles = ({ onAddClick }) => {
  const { user } = useAuth();
  const { stories, fetchStories, loading, error, openViewer } = useStoryStore(); // store actions/state

  // Load stories once on mount if list is empty.
  // Load stories once if empty
  useEffect(() => {
    if (!stories.length) fetchStories();
  }, [stories.length, fetchStories]);

  // Build groups: first index for that user, unseen flag, latest timestamp
  const groups = useMemo(() => {
    const map = new Map();
    stories.forEach((s, idx) => {
      const uid = s.user?._id || (typeof s.user === 'string' ? s.user : undefined);
      if (!uid) return;
      if (!map.has(uid)) {
        map.set(uid, { user: s.user, hasUnseen: !s.hasViewed, latestStoryAt: s.createdAt, startIndex: idx });
      } else {
        const g = map.get(uid);
        if (!s.hasViewed) g.hasUnseen = true;
        if (new Date(s.createdAt) > new Date(g.latestStoryAt)) g.latestStoryAt = s.createdAt;
      }
    });
    return Array.from(map.values()).sort((a,b) => new Date(b.latestStoryAt) - new Date(a.latestStoryAt));
  }, [stories]);

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
        {loading && !groups.length && ( // skeleton placeholders while first load
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="story-circle skeleton">
              <div className="skeleton-inner" />
              <span className="story-username skeleton-text" />
            </div>
          ))
        )}
        {groups.map((g, idx) => (
          <div
            key={g.user?._id || idx}
            className={`story-circle ${g.hasUnseen ? 'unviewed' : 'viewed'}`}
            // Open viewer at this user's first story
            onClick={() => openViewer(g.startIndex)}
            title={g.user?.username}
          >
            <div className="story-avatar-wrap">
              <img
                src={g.user?.profileImage || '/default-avatar.png'}
                alt={g.user?.username || 'story'}
                className="story-avatar"
                loading="lazy"
              />
            </div>
            <span className="story-username">{g.user?.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCircles;