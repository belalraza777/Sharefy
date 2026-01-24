import { create } from 'zustand';
import {
  savePost as savePostApi,
  unSavePost as unSavePostApi,
  getSavedPosts as getSavedPostsApi,
} from '../api/savedPostApi';

// Centralized saved-posts store
// Adds an `initialized` flag to avoid repeated fetching across many buttons/components
const useSavedPostStore = create((set, get) => ({
  savedPosts: [],
  loading: false,
  error: null,
  initialized: false,

  // Save a post
  savePost: async (postId) => {
    set({ loading: true, error: null });
    const result = await savePostApi(postId);
    set({ loading: false });
    if (result.success) {
      set((state) => ({
        savedPosts: [result.data, ...state.savedPosts],
      }));
      // Once a post is saved successfully, the store can be considered initialized
      if (!get().initialized) set({ initialized: true });
    }
    return result;
  },
  // UnSave a post
  unSavePost: async (postId) => {
    set({ loading: true, error: null });
    const result = await unSavePostApi(postId);
    set({ loading: false });
    if (result.success) {
      set((state) => ({
        savedPosts: state.savedPosts.filter(
          (post) => post._id !== result.data._id
        ),
      }));
      // Keep initialized as-is; unsaving doesn't change the loaded state
    }
    return result;
  },

  // Get all saved posts
  getSavedPosts: async () => {
    set({ loading: true, error: null });
    const result = await getSavedPostsApi();
    if (result.success) {
      set({ savedPosts: result.data, loading: false, initialized: true });
    } else {
      set({ error: result.message, loading: false });
    }
    return result;
  },

  // Ensure we only fetch once per session/mount cascades
  ensureSavedPosts: async () => {
    const { initialized, loading } = get();
    if (initialized || loading) return;
    await get().getSavedPosts();
  },
}));

export default useSavedPostStore;
