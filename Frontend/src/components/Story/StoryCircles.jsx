import React, { useEffect, useMemo } from 'react';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import { SkeletonStory } from '../Skeleton/Skeleton';
import './Story.css';

// Displays story circles grouped by user with unseen indicator
const StoryCircles = ({ onAddClick }) => {
  const { user } = useAuth();
  const { stories, fetchStories, loading, error, openViewer } = useStoryStore();

  // Fetch stories once when component mounts
  useEffect(() => {
    if (!stories.length) fetchStories();
  }, [stories.length, fetchStories]);

  // Build unique story circles per user (memoized for performance)
  const circles = useMemo(() => {
    const map = new Map();

    stories.forEach((story, index) => {
      const userObj = story.user;
      const userId = userObj?._id || (typeof userObj === 'string' ? userObj : null);
      if (!userId) return;

      // Create circle for user if not already present
      if (!map.has(userId)) {
        map.set(userId, {
          user: userObj,
          startIndex: index,
          hasUnseen: !story.hasViewed,
        });
      } 
      // Mark unseen if any story is unviewed
      else if (!story.hasViewed) {
        map.get(userId).hasUnseen = true;
      }
    });

    return Array.from(map.values());
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
        {/* Add story circle */}
        <div
          className="story-circle add"
          onClick={onAddClick}
          title="Add Story"
        >
          <div className="add-inner">+</div>
          <span className="story-username">{user?.username || 'You'}</span>
        </div>

        {/* Loading skeletons */}
        {loading && !circles.length &&
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStory key={i} />
          ))
        }

        {/* User story circles */}
        {circles.map((circle, i) => (
          <div
            key={circle.user?._id || i}
            className={`story-circle ${circle.hasUnseen ? 'unviewed' : 'viewed'}`}
            onClick={() => openViewer(circle.startIndex)}
            title={circle.user?.username}
          >
            <div className="story-avatar-wrap">
              <img
                src={circle.user?.profileImage || '/default-avatar.png'}
                alt={circle.user?.username || 'story'}
                className="story-avatar"
                loading="lazy"
              />
            </div>
            <span className="story-username">{circle.user?.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryCircles;
