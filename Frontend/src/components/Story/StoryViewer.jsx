// Fullscreen story viewer.
// Uses the global story store for the current story and navigation.
// Supports keyboard navigation, backdrop close, and owner-only delete.

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useStoryStore from '../../store/storyStore';
import { useAuth } from '../../context/authContext';
import './StoryViewer.css';
import { IoMdClose } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import { toast } from 'sonner';

const StoryViewer = () => {
  const { user } = useAuth();
  const { stories, viewer, closeViewer, openViewer, deleteStory } = useStoryStore();

  // Current story from the viewer index
  const index = viewer.index;  //Index of the currently viewed story
  const story = index !== null ? stories[index] : null;  //Current story object based on the index
  const isOpen = viewer.open && !!story;  //Is the viewer open and is there a valid story to display
  const isOwner = story?.user?._id === user?.id;

  // ESC closes the viewer, arrow keys navigate stories
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

  // Prevent background scrolling while the viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Open previous story
  const prev = () => {
    if (index !== null && index > 0) {
      openViewer(index - 1);
    }
  };

  // Open next story
  const next = () => {
    if (index !== null && index < stories.length - 1) {
      openViewer(index + 1);
    }
  };

  // Delete current story after confirmation
  const handleDelete = () => {
    if (index === null) return;
    toast("Delete this story?", {
      action: {
        label: "Delete",
        onClick: async () => {
          const res = await deleteStory(index);

          if (res.success) {
            toast.success("Story deleted");
            // After deletion, close viewer if it was the last story
            if (index >= stories.length - 1) {
              closeViewer();
            } else {
              openViewer(index);
            }
          } else {
            toast.error(res.message || "Failed to delete story");
          }
        }
      },
      cancel: {
        label: "Cancel"
      }
    });
  };

  if (!isOpen) return null;

  return createPortal(
    // Click outside to close
    <div
      className="story-viewer-overlay"
      onClick={closeViewer}
      role="dialog"
      aria-modal="true"
    >
      {/* Prevent closing when clicking inside */}
      <div
        className="story-viewer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="story-viewer-header">
          <div className="story-user">
            <img
              src={story.user?.profileImage || '/default-avatar.png'}
              alt={story.user?.username}
            />
            <span className="story-username-viewer">
              {story.user?.username}
            </span>
          </div>

          <div className="story-header-right">
            {/* Show total views only to the story owner */}
            {isOwner && story.viewCount !== undefined && (
              <span
                className="story-views-pill"
                title="Total views"
              >
                <FiEye /> {story.viewCount}
              </span>
            )}

            <div className="story-actions">
              {isOwner && (
                <button
                  className="btn danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}

              <button
                className="btn close"
                onClick={closeViewer}
                aria-label="Close story viewer"
              >
                <IoMdClose />
              </button>
            </div>
          </div>
        </div>

        <div className="story-media-wrapper">
          {/* Render image or video based on media type */}
          {story.media?.type?.startsWith('video') ? (
            <video
              src={story.media?.url}
              controls
              autoPlay
            />
          ) : (
            <img
              src={story.media?.url}
              alt={story.caption || 'story'}
            />
          )}

          {story.caption && (
            <div className="story-caption-overlay">
              <p>{story.caption}</p>
            </div>
          )}
        </div>

        <div className="nav-buttons">
          <button
            className="nav prev"
            aria-label="Previous story"
            onClick={prev}
            disabled={index === 0}
          >
            ◀
          </button>

          <button
            className="nav next"
            aria-label="Next story"
            onClick={next}
            disabled={index === stories.length - 1}
          >
            ▶
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StoryViewer;