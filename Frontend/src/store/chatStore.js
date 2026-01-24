import { create } from 'zustand';
import {
  getConversations as getConversationsApi,
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
} from '../api/chatApi';

// Chat store: keeps conversation list, per-user messages, current active chat,
// loading/error flags, and online user ids. All actions are small and focused.
const useChatStore = create((set, get) => ({

  // List of conversation objects (e.g. users you have chatted with)
  conversations: [],

  // Messages keyed by userId: { userId: [message, ...] }
  //Important: messages are stored per user to allow easy access and avoid mixing messages from different users
  messages: {},

  // Currently opened chat user id
  activeUserId: null,
  // UI flags
  loading: false,
  error: null,
  // Online user ids from socket layer
  onlineUsers: null,

  // Select a chat; lazily fetch messages the first time user is opened
  setActiveUser: (userId) => {
    set({ activeUserId: userId });
    if (userId && !get().messages[userId]) {
      get().getMessages(userId);
    }
  },

  // Load all conversations
  getConversations: async () => {
    set({ loading: true, error: null });
    const result = await getConversationsApi();
    if (result.success) {
      set({ conversations: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Load messages for one user
  getMessages: async (userId) => {
    set({ loading: true, error: null });
    const result = await getMessagesApi(userId);
    if (result.success) {
      set((state) => ({
        // Merge new messages into messages object like: { userId: [msg, ...] }
        messages: {
          ...state.messages,
          [userId]: result.data
        },
        loading: false,
      }));
    } else {
      set({ error: result.message, loading: false });
    }
  },

  // Send a message and append it locally on success
  sendMessage: async (userId, messageText) => {
    const result = await sendMessageApi(userId, messageText);
    if (result.success) {
      set((state) => ({
        messages: {
          // Append to existing messages for userId 
          ...state.messages,
          [userId]: [...(state.messages[userId] || []), result.data],
        },
      }));
    }
    return result;
  },

  // Append a socket-delivered incoming message
  addIncomingMessage: (message) => {
    const userId = message.senderId;
    set((state) => ({
      messages: {   // Append to existing messages for userId
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
      },
    }));
  },

  // Replace online users list
  setOnlineUsers: (userIds) => {
    set({ onlineUsers: userIds });
  }
}));

export default useChatStore; // Export hook for components
