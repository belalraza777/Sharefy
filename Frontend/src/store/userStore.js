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

const useUserStore = create((set) => ({
  profile: null,
  followers: [],
  following: [],
  loading: false,
  error: null,

  getUserProfile: async (username) => {
    set({ loading: true, error: null });
    const result = await getUserProfileApi(username);
    if (result.success) {
      set({ profile: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

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

  followUser: async (id) => {
    // This function just calls the API. The component is responsible
    // for updating the UI (e.g., refetching the user profile).
    return await followUserApi(id);
  },

  unfollowUser: async (id) => {
    return await unfollowUserApi(id);
  },

  getFollowers: async (id) => {
    set({ loading: true, error: null });
    const result = await getFollowersApi(id);
    if (result.success) {
      set({ followers: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  getFollowing: async (id) => {
    set({ loading: true, error: null });
    const result = await getFollowingApi(id);
    if (result.success) {
      set({ following: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },
}));

export default useUserStore;