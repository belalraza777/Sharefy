import { create } from "zustand";
import * as api from "../api/notificationApi.js";

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  
  getNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.getNotifications();
      if (response.success) {
        const unread = response.data.filter(n => !n.isRead).length;
        set({ notifications: response.data, unreadCount: unread, loading: false });
      }
    } catch (error) {
      console.log(error);
      set({ loading: false });
    }
  },
  
  markAsRead: async (id) => {
    try {
      const response = await api.markAsRead(id);
      if (response.success) {
        set((state) => {
          const updated = state.notifications.map((notification) =>
            notification._id === id ? { ...notification, isRead: true } : notification
          );
          const unread = updated.filter(n => !n.isRead).length;
          return { notifications: updated, unreadCount: unread };
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.markAllAsRead();
      if (response.success) {
        set((state) => {
          const updated = state.notifications.map((notification) => ({ ...notification, isRead: true }));
          return { notifications: updated, unreadCount: 0 };
        });
      }
    } catch (error) {
      console.log(error);
    }
  },


  // Add new notification from socket
  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      const unread = updated.filter(n => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });
  },
}));

export default useNotificationStore;
