import { create } from 'zustand';
import {
  getUserProfile as getUserProfileApi,
  updateProfile as updateProfileApi,
  uploadProfilePic as uploadProfilePicApi,
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
  getFollowers as getFollowersApi,
  getFollowing as getFollowingApi,
} from '../api/userApi';

// Helper function to create the initial state for followers/following lists
const createFollowState = () => ({
  items: [],
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
});

// Zustand store for user-related state and actions
const useUserStore = create((set, get) => ({
  profile: null, // User profile data
  followers: createFollowState(), //Followers list state
  following: createFollowState(), //Following list state
  loading: false,
  error: null,

  // Fetch user profile by username
  getUserProfile: async (username) => {
    set({ loading: true, error: null });
    const result = await getUserProfileApi(username);
    if (result.success) {
      set({ profile: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },
// Update user profile with new data
  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    const result = await updateProfileApi(userData);
    if (result.success) {
      set({ profile: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
    return result;
  },
// Upload a new profile picture
  uploadProfilePic: async (file) => {
    set({ loading: true, error: null });
    const result = await uploadProfilePicApi(file);
    if (result.success) {
        set((state) => ({ profile: { ...state.profile, ...result.data }, loading: false }));
    } else {
        set({ error: result.message, loading: false });
    }
    return result;
  },
// Follow a user by ID
  followUser: async (id) => {
    // This function just calls the API. The component is responsible
    // for updating the UI (e.g., refetching the user profile).
    return await followUserApi(id);
  },
// Unfollow a user by ID
  unfollowUser: async (id) => {
    return await unfollowUserApi(id);
  },

// Reset the follow list for a specific type (followers or following)
  resetFollowList: (type) => {
    set({ [type]: createFollowState() });
  },
// Convenience functions to reset followers or following lists
  resetFollowers: () => {
    set({ followers: createFollowState() });
  },

  resetFollowing: () => {
    set({ following: createFollowState() });
  },

// Fetch followers or following list with pagination
  fetchFollowList: async (type, id, { page = 1, limit = 20 } = {}) => {
    const api = type === 'followers' ? getFollowersApi : getFollowingApi;
    set((state) => ({
      [type]: { ...state[type], loading: true, error: null }
    }));

    const result = await api(id, { page, limit });
    if (result.success) {
      const { users = [], hasMore, page: currentPage } = result.data || {};
      set((state) => ({
        [type]: {
          ...state[type],
          items: page === 1 ? users : [...state[type].items, ...users],
          page: currentPage || page,
          hasMore: Boolean(hasMore),
          loading: false,
        }
      }));
    } else {
      set((state) => ({
        [type]: { ...state[type], error: result.message, loading: false }
      }));
    }

    return result;
  },
// Convenience functions to fetch followers or following lists
  getFollowers: async (id, params) => {
    return await get().fetchFollowList('followers', id, params);
  },
// Convenience function to fetch following list
  getFollowing: async (id, params) => {
    return await get().fetchFollowList('following', id, params);
  },
}));

export default useUserStore;