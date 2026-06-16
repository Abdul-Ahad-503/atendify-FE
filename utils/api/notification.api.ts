import apiClient, { handleApiError } from "./client";
import { ApiResponse, Notification, PaginationInfo } from "./types";

export const notificationApi = {
  /**
   * Get user notifications
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{
    notifications: Notification[];
    pagination: PaginationInfo;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          notifications: Notification[];
          pagination: PaginationInfo;
        }>
      >("/notifications", { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const response = await apiClient.put<ApiResponse>(
        `/notifications/${notificationId}/read`,
      );

      if (!response.data.success) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      const response = await apiClient.put<ApiResponse>(
        "/notifications/mark-all-read",
      );

      if (!response.data.success) {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/notifications/${notificationId}`,
      );

      if (!response.data.success) {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>(
        "/notifications/unread-count",
      );

      if (response.data.success && response.data.data) {
        return response.data.data.count;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  },
  registerPushToken: async (pushToken: string): Promise<void> => {
    try {
      await apiClient.post<ApiResponse>("/user/push-token", { pushToken });
    } catch (error) {
      // Silently fail — don't block login if push token fails
      console.warn("Failed to register push token:", error);
    }
  },
};
