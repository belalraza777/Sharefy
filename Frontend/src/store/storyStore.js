import { create } from 'zustand';
import {
  createStory as createStoryApi,
  getAllStories as getAllStoriesApi,
  viewStory as viewStoryApi,
  deleteStory as deleteStoryApi,
} from '../api/storyApi';

// Story shape (simplified) returned by backend:
// _id, user { _id, username, profileImage }, media { url,type }, caption,
// viewers[], viewCount (owner only), hasViewed, createdAt
// We store as-is and only derive minimal UI flags.

const useStoryStore = create((set, get) => ({
  // Core state
  stories: [],              // All fetched stories (flat list)
  loading: false,           // Fetching stories flag
  error: null,              // Last fetch error message
  viewer: { open: false, index: null }, // Current open viewer index
  creating: { uploading: false, error: null }, // Create story operation state

  // Fetch all stories (followed + own)
  // Fetch all stories once (skip if already loading)
  fetchStories: async () => {
    if (get().loading) return; // simple guard
    set({ loading: true, error: null });
    const result = await getAllStoriesApi();
    if (result.success) {
      set({ stories: result.data || [], loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Create a new story
  // Create a new story; prepend optimistically on success
  createStory: async (file, caption = '') => {
    set((state) => ({ creating: { ...state.creating, uploading: true, error: null } }));
    const result = await createStoryApi(file, caption);
    set((state) => ({ creating: { ...state.creating, uploading: false } }));
    if (result.success) {
      set((state) => ({ stories: [result.data, ...state.stories] }));
    } else {
      set((state) => ({ creating: { ...state.creating, error: result.message, uploading: false } }));
    }
    return result;
  },

  // Open viewer for specific story index
  // Open viewer for given index; trigger view mark if needed
  openViewer: (index) => {
    set({ viewer: { open: true, index } });
    const story = get().stories[index];
    if (story && !story.hasViewed) {
      get().viewStory(index);
    }
  },

  // Close viewer
  // Close viewer overlay
  closeViewer: () => set({ viewer: { open: false, index: null } }),

  // View story (mark as viewed)
  // Mark story viewed (optimistic; rollback if API fails)
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

  // Delete story
  // Delete story (optimistic removal with rollback)
  deleteStory: async (index) => {
    const story = get().stories[index];
    if (!story) return { success: false, message: 'Story not found' };
    const previousStories = get().stories;
    set({ stories: previousStories.filter((_, i) => i !== index) });
    const result = await deleteStoryApi(story._id);
    if (!result.success) {
      set({ stories: previousStories }); // rollback on failure
    }
    return result;
  },
}));

export default useStoryStore;
