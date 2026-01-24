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

      set((state) => {
        const prevPost = state.post;
        // Shallow merge updated post into previous post
        let mergedPost = prevPost?._id === id ? { ...prevPost, ...updatedPost } : prevPost;

        // If the API returned comment IDs (not populated objects), keep the
        // previously populated comments to avoid breaking the UI.
        if (
          prevPost &&
          prevPost.comments &&
          Array.isArray(updatedPost.comments) &&
          updatedPost.comments.length > 0
        ) {
          const first = updatedPost.comments[0];
          const isPopulated = typeof first === 'object' && first !== null;
          if (!isPopulated) {
            mergedPost = { ...mergedPost, comments: prevPost.comments };
          }
        }

        return {
          posts: state.posts.map((p) => {
            if (p._id !== id) return p;
            // Merge response into existing feed post but preserve populated
            // `user` and `comments` if server returned unpopulated values.
            let merged = { ...p, ...updatedPost };
            if (p.user && updatedPost.user && typeof updatedPost.user !== 'object') merged.user = p.user;
            if (p.comments && Array.isArray(updatedPost.comments) && updatedPost.comments.length > 0) {
              const first = updatedPost.comments[0];
              const isPopulated = typeof first === 'object' && first !== null;
              if (!isPopulated) merged.comments = p.comments;
            }
            return merged;
          }),
          post: mergedPost,
          likingPostId: null,
        };
      });
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

      set((state) => {
        const prevPost = state.post;
        let mergedPost = prevPost?._id === id ? { ...prevPost, ...updatedPost } : prevPost;

        if (
          prevPost &&
          prevPost.comments &&
          Array.isArray(updatedPost.comments) &&
          updatedPost.comments.length > 0
        ) {
          const first = updatedPost.comments[0];
          const isPopulated = typeof first === 'object' && first !== null;
          if (!isPopulated) {
            mergedPost = { ...mergedPost, comments: prevPost.comments };
          }
        }

        return {
          posts: state.posts.map((p) => {
            if (p._id !== id) return p;
            let merged = { ...p, ...updatedPost };
            if (p.user && updatedPost.user && typeof updatedPost.user !== 'object') merged.user = p.user;
            if (p.comments && Array.isArray(updatedPost.comments) && updatedPost.comments.length > 0) {
              const first = updatedPost.comments[0];
              const isPopulated = typeof first === 'object' && first !== null;
              if (!isPopulated) merged.comments = p.comments;
            }
            return merged;
          }),
          post: mergedPost,
          likingPostId: null,
        };
      });
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
