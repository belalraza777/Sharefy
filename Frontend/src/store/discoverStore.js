import { create } from 'zustand';
import { getSuggestedUsers as getSuggestedUsersApi, getSuggestedPosts as getDiscoverPostsApi } from '../api/discoverApi';

const useDiscoverStore = create((set, get) => ({
    // State: lists of suggested users and posts
    suggestedUsers: [],
    suggestedPosts: [],

    // Loading flags for each resource to control UI spinners
    loadingUsers: false,
    loadingPosts: false,

    // Last error message (if any) from API calls
    error: null,

    // Actions: fetch suggested users from the API
    // limit: number of users to request (default 20)
    fetchSuggestedUsers: async (limit = 20) => {
        set({ loadingUsers: true, error: null });
        const res = await getSuggestedUsersApi(limit);
        if (res.success) {
            set({ suggestedUsers: res.data, loadingUsers: false });
        } else {
            set({ error: res.message || 'Failed to load suggestions', loadingUsers: false });
        }
    },

    // Actions: fetch discover posts from the API
    //  page: page number (default 1)
    fetchSuggestedPosts: async ( page = 1) => {
        set({ loadingPosts: true, error: null });
        const res = await getDiscoverPostsApi( page);
        if (res.success) {
            set({ suggestedPosts: res.data, loadingPosts: false });
        } else {
            set({ error: res.message || 'Failed to load posts', loadingPosts: false });
        }
    },
}));

export default useDiscoverStore;
