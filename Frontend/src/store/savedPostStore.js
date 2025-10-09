import { create } from 'zustand';
import {
  savePost as savePostApi,
  unSavePost as unSavePostApi,
  getSavedPosts as getSavedPostsApi,
} from '../api/savedPostApi';

const useSavedPostStore = create((set) => ({
  savedPosts: [],
  loading: false,
  error: null,

  // Save a post
  savePost: async (postId) => {
    set({ loading: true, error: null });
    const result = await savePostApi(postId);
    set({ loading: false });
    if (result.success) {
      set((state) => ({
        savedPosts: [result.data, ...state.savedPosts],
      }));
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
    }
    return result;
  },

  // Get all saved posts
  getSavedPosts: async () => {
    set({ loading: true, error: null });
    const result = await getSavedPostsApi();
    if (result.success) {
      set({ savedPosts: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },
}));

export default useSavedPostStore;
