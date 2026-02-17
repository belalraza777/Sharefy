import { create } from 'zustand';
import {
  getConversations as getConversationsApi,
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
} from '../api/chatApi';
import { persist } from 'zustand/middleware';

// Chat store: keeps conversation list, per-user messages, current active chat,
// loading/error flags, and online user ids. All actions are small and focused.
const useChatStore = create(
  persist(
    (set, get) => ({
      // List of conversation objects (e.g. users you have chatted with)
      conversations: [],

      // Messages keyed by userId: { userId: [message, ...] }
      //Important: messages are stored per user to allow easy access and avoid mixing messages from different users
      messages: {},

      //UnRead message counts keyed by userId: { userId: count }
      unreadCounts: {},

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

      //mark messages as read by resetting unread count for a user
      markAsRead: (userId) => {
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [userId]: 0,
          },
        }));
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
            // Reset unread count for this user since we just sent a message
            unreadCounts: {
              ...state.unreadCounts,
              [userId]: 0, // Reset unread count when sending a message
            },
          }));
        }
        return result;
      },

      // Append a socket-delivered incoming message
      addIncomingMessage: (message) => {
        const userId = message.senderId;
        set((state) => {
          const isActive = state.activeUserId === userId;

          return {
            // Append to messages for this user, or create new array if it doesn't exist
            messages: {
              ...state.messages,
              [userId]: [...(state.messages[userId] || []), message],
            },
            // If the chat with this user is not currently active, increment the unread count
            unreadCounts: {
              ...state.unreadCounts,
              [userId]: isActive
                ? 0
                : (state.unreadCounts[userId] || 0) + 1,
            },
          };
        });
      },

      // Replace online users list
      setOnlineUsers: (userIds) => {
        set({ onlineUsers: userIds });
      }
    }),

    // Persist only the unread messages count in localStorage to survive page refreshes
    {
      name: "chat-unread-storage", // localStorage key
      partialize: (state) => ({
        unreadCounts: state.unreadCounts,
      }),
    }
  )
);


export default useChatStore; // Export hook for components
