import { create } from 'zustand';
import { searchUsers } from '../api/searchApi';

const useSearchStore = create((set) => ({
    result: [],
    loading: false,
    error: null,
    search: async (query) => {
        set({ loading: true, error: null });
        try {
            const response = await searchUsers(query);
            if (response.success) {
                set({ result: response.data, loading: false });
            } else {
                set({ error: response.message, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },
}));

export default useSearchStore;
