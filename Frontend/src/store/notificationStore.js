import { create } from "zustand";
import * as api from "../api/notificationApi.js";

const useNotificationStore = create((set) => ({
  notifications: [],
  getNotifications: async () => {
    try {
      const response = await api.getNotifications();
      if (response.success) {
        set({ notifications: response.data });
      }
    } catch (error) {
      console.log(error);
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await api.markAsRead(id);
      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification._id === id ? { ...notification, isRead: true } : notification
          ),
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
}));

export default useNotificationStore;
