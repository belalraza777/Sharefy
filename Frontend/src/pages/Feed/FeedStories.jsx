// FeedStories.jsx
import React, { useEffect, useState } from 'react';
import './FeedStories.css';
import { createPortal } from 'react-dom';
import StoryCircles from '../../components/Story/StoryCircles';
import StoryViewer from '../../components/Story/StoryViewer';
import CreateStory from '../../components/Story/CreateStory';

// Handles story UI and modal lifecycle
export default function FeedStories() {
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Lock body scroll when story modal is open
  useEffect(() => {
    document.body.classList.toggle('modal-open', showCreateStory);
    return () => document.body.classList.remove('modal-open');
  }, [showCreateStory]);

  return (
    <div className="feed-stories-section">
      <StoryCircles onAddClick={() => setShowCreateStory(true)} />
      <StoryViewer />

      {showCreateStory &&
        createPortal(
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
    </div>
  );
}
