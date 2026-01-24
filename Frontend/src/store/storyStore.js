// Story store (Zustand)
// Keeps a flat list of stories and viewer state.
// Server may send grouped or flat data — we always flatten.
import { create } from 'zustand';
import {
  createStory as createStoryApi,
  getAllStories as getAllStoriesApi,
  viewStory as viewStoryApi,
  deleteStory as deleteStoryApi,
} from '../api/storyApi';

// Each story has: _id, user, media, caption, hasViewed, createdAt, etc.

const useStoryStore = create((set, get) => ({
  // Core state
  stories: [],              // Flat list of stories for rendering and viewer navigation
  loading: false,           // Is the store currently fetching stories
  error: null,              // Last fetch error message (if any)
  viewer: { open: false, index: null }, // Story viewer modal state
  creating: { uploading: false, error: null }, // Create story async state

  // Get stories (followed + own). Flatten if grouped.
  fetchStories: async () => {
    if (get().loading) return; // skip if already loading
    set({ loading: true, error: null });
    const result = await getAllStoriesApi();
    if (result.success) {
      // Server may return groups or a flat list.
      const payload = result.data || [];
      let flat = [];
      if (Array.isArray(payload) && payload.length && payload[0].stories) {
        // Grouped: take stories from each group in order
        payload.forEach(g => {
          (g.stories || []).forEach(s => flat.push(s));
        });
      } else {
        flat = Array.isArray(payload) ? payload : [];
      }
      set({ stories: flat, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Create a new story. After upload, refresh the list.
  createStory: async (file, caption = '') => {
    set((state) => ({ creating: { ...state.creating, uploading: true, error: null } }));
    const result = await createStoryApi(file, caption);
    set((state) => ({ creating: { ...state.creating, uploading: false } }));
    if (result.success) {
      // Keeps order and server-derived flags in sync
      await get().fetchStories();
    } else {
      set((state) => ({ creating: { ...state.creating, error: result.message, uploading: false } }));
    }
    return result;
  },

  // Open viewer at index; mark as viewed if needed.
  openViewer: (index) => {
    set({ viewer: { open: true, index } });
    const story = get().stories[index];
    if (story && !story.hasViewed) {
      get().viewStory(index);
    }
  },

  // Close viewer.
  closeViewer: () => set({ viewer: { open: false, index: null } }),

  // Mark story as viewed (optimistic). Update viewCount for own stories.
  viewStory: async (index) => {
    const story = get().stories[index];
    if (!story || story.hasViewed) return;
    set((state) => ({
      stories: state.stories.map((s, i) => i === index ? { ...s, hasViewed: true } : s)
    }));
    const result = await viewStoryApi(story._id);
    if (!result.success) {
      set((state) => ({
        stories: state.stories.map((s, i) => i === index ? { ...s, hasViewed: false } : s)
      }));
    } else if (result.data && result.data.viewCount !== undefined) {
      set((state) => ({
        stories: state.stories.map((s, i) => i === index ? { ...s, viewCount: result.data.viewCount } : s)
      }));
    }
  },

  // Delete a story. Remove optimistically; rollback on error; then refresh.
  deleteStory: async (index) => {
    const story = get().stories[index];
    if (!story) return { success: false, message: 'Story not found' };
    const previousStories = get().stories;
    set({ stories: previousStories.filter((_, i) => i !== index) });
    const result = await deleteStoryApi(story._id);
    if (!result.success) {
      set({ stories: previousStories }); // rollback on failure
    }
    // After delete, refetch to ensure indices remain valid
    await get().fetchStories();
    return result;
  },
}));

export default useStoryStore;
