// services/NotificationService.js
import axiosInstance from "../utils/axiosInstance";

const NotificationService = {
  // Get notifications (page, limit optional)
  getNotifications: async (params = { page: 1, limit: 50 }) => {
    const res = await axiosInstance.get("/portal/notifications", { params });
    // backend returns { notifications: [...], pagination: {...} }
    return res.data;
  },

  // unread count
  getUnreadCount: async () => {
    const res = await axiosInstance.get("/portal/notifications/unread");
    // { count: N }
    return res.data;
  },

  // mark single as read
  markAsRead: async (id) => {
    const res = await axiosInstance.patch(`/portal/notifications/${id}/read`);
    return res.data;
  },

  // mark all as read
  markAllAsRead: async () => {
    const res = await axiosInstance.patch(`/portal/notifications/read-all`);
    return res.data;
  },

  // delete a notification
  deleteNotification: async (id) => {
    const res = await axiosInstance.delete(`/portal/notifications/${id}`);
    return res.data;
  },
};

export default NotificationService;
