import { create } from 'zustand';
import {
  addComment as addCommentApi,
  deleteComment as deleteCommentApi,
} from '../api/commentApi';

const useCommentStore = create((set) => ({
  addComment: async (postId, commentData) => {
    // This function just calls the API. The component is responsible
    // for updating the UI (e.g., refetching the post or comments).
    return await addCommentApi(postId, commentData);
  },

  deleteComment: async (postId, commentId) => {
    // This function just calls the API. The component is responsible
    // for updating the UI (e.g., refetching the post or comments).
    return await deleteCommentApi(postId, commentId);
  },
}));

export default useCommentStore;
