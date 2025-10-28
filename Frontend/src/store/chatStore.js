import { create } from 'zustand';
import {
  getConversations as getConversationsApi,
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
} from '../api/chatApi';

const useChatStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeUserId: null,
  loading: false,
  error: null,

  // Set the active user for chat
  setActiveUser: (userId) => {
    set({ activeUserId: userId });
    if (userId && !get().messages[userId]) {
      get().getMessages(userId);
    }
  },

  // Get all conversations (users that have been chatted with)
  getConversations: async () => {
    set({ loading: true, error: null });
    const result = await getConversationsApi();
    if (result.success) {
      set({ conversations: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Get messages with a specific user
  getMessages: async (userId) => {
    set({ loading: true, error: null });
    const result = await getMessagesApi(userId);
    if (result.success) {
      set((state) => ({
        messages: { ...state.messages, [userId]: result.data },
        loading: false,
      }));
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Send a message to a user
  sendMessage: async (userId, messageText) => {
    const result = await sendMessageApi(userId, messageText);
    if (result.success) {
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: [...(state.messages[userId] || []), result.data],
        },
      }));
    }
    return result;
  },

  // Add an incoming message from socket
  addIncomingMessage: (message) => {
    const userId = message.senderId;
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
      },
    }));
  },
}));

export default useChatStore;
