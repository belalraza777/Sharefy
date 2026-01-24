import { create } from 'zustand';
import {
  getFeed as getFeedApi,
  createPost as createPostApi,
  getPostById as getPostByIdApi,
  likePost as likePostApi,
  unlikePost as unlikePostApi,
  deletePost as deletePostApi,
} from '../api/postApi';

const usePostStore = create((set) => ({
  posts: [],
  post: null,
  loading: false,
  error: null,

  // Fetch the feed
  getFeed: async (page = 1) => {
    set({ loading: true, error: null });
    const result = await getFeedApi(page);
    if (result.success) {
      set({ posts: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Create a new post and add it to the top of the feed
  createPost: async (postData) => {
    set({ loading: true, error: null });
    const result = await createPostApi(postData);
    set({ loading: false });
    if (result.success) {
      set((state) => ({
        posts: [result.data, ...state.posts], // Add new post at the top
      }));
    }
    return result;
  },

  // Get a single post by ID
  getPostById: async (id) => {
    set({ loading: true, error: null });
    const result = await getPostByIdApi(id);
    if (result.success) {
      set({ post: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Like a post
  likePost: async (id) => {
    return await likePostApi(id);
  },

  // Unlike a post
  unlikePost: async (id) => {
    return await unlikePostApi(id);
  },

  // Delete a post
  deletePost: async (id) => {
    const result = await deletePostApi(id);
    if (result.success) {
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== id), // Remove deleted post from feed
      }));
    }
    return result;
  },
}));

export default usePostStore;
