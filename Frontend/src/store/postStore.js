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
  // Feed posts
  posts: [],

  // Single post (detail page)
  post: null,

  // Global loading state
  loading: false,

  // API error state
  error: null,

  // Track which post is being liked/unliked
  likingPostId: null,

  // Fetch feed posts from server
  getFeed: async (page = 1) => {
    set({ loading: true, error: null });
    const result = await getFeedApi(page);

    if (result.success) {
      set({ posts: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Create post and prepend to feed
  createPost: async (postData) => {
    set({ loading: true, error: null });
    const result = await createPostApi(postData);
    set({ loading: false });

    if (result.success) {
      set((state) => ({
        posts: [result.data, ...state.posts],
      }));
    }

    return result;
  },

  // Fetch single post by id
  getPostById: async (id) => {
    set({ loading: true, error: null });
    const result = await getPostByIdApi(id);

    if (result.success) {
      set({ post: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Like post and sync store with server response
  likePost: async (id) => {
    set({ likingPostId: id });
    const result = await likePostApi(id);

    if (result.success) {
      const updatedPost = result.data;

      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === id ? updatedPost : p
        ),
        post:
          state.post?._id === id ? updatedPost : state.post,
        likingPostId: null,
      }));
    } else {
      set({ likingPostId: null });
    }

    return result;
  },

  // Unlike post and sync store
  unlikePost: async (id) => {
    set({ likingPostId: id });
    const result = await unlikePostApi(id);

    if (result.success) {
      const updatedPost = result.data;

      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === id ? updatedPost : p
        ),
        post:
          state.post?._id === id ? updatedPost : state.post,
        likingPostId: null,
      }));
    } else {
      set({ likingPostId: null });
    }

    return result;
  },

  // Delete post from feed and detail view
  deletePost: async (id) => {
    const result = await deletePostApi(id);

    if (result.success) {
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
        post: state.post?._id === id ? null : state.post,
      }));
    }

    return result;
  },
}));

export default usePostStore;
