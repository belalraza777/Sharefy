// StoryViewer: fullscreen modal to play a single story.
// Uses the flat `stories` list and the store's `viewer.index`.
// Supports next/prev, close on backdrop/ESC, and delete (owner only).
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import './Story.css';

// Fullscreen overlay to display a single story media with caption.
// Navigation: left/right arrows. Close on backdrop click or ESC.
// Delete button visible only for owner's story.

// No props: uses global store viewer state.
const StoryViewer = () => {
  const { user } = useAuth();
  const { stories, viewer, closeViewer, openViewer, deleteStory } = useStoryStore();

  const index = viewer.index;
  const story = index !== null ? stories[index] : null;
  const isOpen = viewer.open && !!story;
  const isOwner = story && story.user && user && story.user._id === user._id;

  // Keyboard shortcuts: ESC close, arrows navigate
  const handleKey = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }, [isOpen, closeViewer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Previous story
  const prev = () => {
    if (index === null) return;
    if (index > 0) openViewer(index - 1);
  };

  // Next story
  const next = () => {
    if (index === null) return;
    if (index < stories.length - 1) openViewer(index + 1);
  };

  // Delete current story (owner only). Close if last item.
  const handleDelete = async () => {
    if (index === null) return;
    const confirm = window.confirm('Delete this story?');
    if (!confirm) return;
    const res = await deleteStory(index);
    if (res.success) {
      // If we deleted last story or viewer becomes invalid, close.
      if (index >= stories.length - 1) {
        closeViewer();
      } else {
        // Stay on same index which now points to next story after removal.
        openViewer(index); // re-open ensures view mark logic.
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="story-viewer-overlay" onClick={closeViewer} role="dialog" aria-modal="true">
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="story-viewer-header">
          <div className="story-user">
            <img src={story.user?.profileImage || '/default-avatar.png'} alt={story.user?.username} />
            <span>{story.user?.username}</span>
          </div>
          <div className="story-actions">
            {isOwner && (
              <button className="btn danger" onClick={handleDelete}>Delete</button>
            )}
            <button className="btn" onClick={closeViewer}>Close</button>
          </div>
        </div>
        <div className="story-media-wrapper">
          {story.media?.type?.startsWith('video') ? (
            <video src={story.media?.url} controls autoPlay />
          ) : (
            <img src={story.media?.url} alt={story.caption || 'story'} />
          )}
          {story.caption && (
            <div className="story-caption-overlay">
              <p>{story.caption}</p>
            </div>
          )}
        </div>
        {(isOwner && story.viewCount !== undefined) && (
          <div className="story-footer">
            <span className="story-views">Views: {story.viewCount}</span>
          </div>
        )}
        <div className="nav-buttons">
          <button className="nav prev" aria-label="Previous story" onClick={prev} disabled={index === 0}>◀</button>
          <button className="nav next" aria-label="Next story" onClick={next} disabled={index === stories.length - 1}>▶</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StoryViewer;