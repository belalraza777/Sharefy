// StoryViewer: fullscreen modal to play a single story.
// Uses the flat `stories` list and the store's `viewer.index`.
// Supports next/prev, close on backdrop/ESC, and delete (owner only).
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import './StoryViewer.css';
import { IoMdClose } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import { toast } from 'sonner';


// Fullscreen overlay to display a single story media with caption.
// Navigation: left/right arrows. Close on backdrop click or ESC.
// Delete button visible only for owner's story.

// No props: uses global store viewer state.
const StoryViewer = () => {
  const { user } = useAuth();
  console.log(user);
  
  const { stories, viewer, closeViewer, openViewer, deleteStory } = useStoryStore();

  console.log(stories);
  
  const index = viewer.index;
  const story = index !== null ? stories[index] : null;
  const isOpen = viewer.open && !!story;
  const isOwner = story && story.user && user && story.user._id === user.id;

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

  // Delete story via sonner toast confirmation (owner only)
  const handleDelete = () => {
    if (index === null) return;
    toast("Delete this story?", {
      action: {
        label: "Delete",
        onClick: async () => {
          const res = await deleteStory(index);
          if (res.success) {
            toast.success('Story deleted');
            if (index >= stories.length - 1) {
              closeViewer();
            } else {
              openViewer(index); // viewer index now points at next story after removal
            }
          } else {
            toast.error(res.message || 'Failed to delete story');
          }
        }
      },
      cancel: {
        label: 'Cancel'
      }
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="story-viewer-overlay" onClick={closeViewer} role="dialog" aria-modal="true">
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="story-viewer-header">
          <div className="story-user">
            <img src={story.user?.profileImage || '/default-avatar.png'} alt={story.user?.username} />
            <span className="story-username-viewer">{story.user?.username}</span>
          </div>
          <div className="story-header-right">
            {isOwner && story.viewCount !== undefined && (
              <span className="story-views-pill" title="Total views"><FiEye /> {story.viewCount}</span>
            )}
            <div className="story-actions">
              {isOwner && (
                <button className="btn danger" onClick={handleDelete}>Delete</button>
              )}
              <button className="btn close" onClick={closeViewer} aria-label="Close story viewer"><IoMdClose /></button>
            </div>
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
        {/* Footer removed; views now shown in header pill */}
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