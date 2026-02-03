import apiClient, { handleApiError } from './client';
import {
  ApiResponse,
  AttendanceStats,
  StudentDashboard,
  TeacherDashboard,
} from './types';

export const dashboardApi = {
  /**
   * Get student dashboard data
   */
  getStudentDashboard: async (): Promise<StudentDashboard> => {
    try {
      const response = await apiClient.get<ApiResponse<StudentDashboard>>(
        '/dashboard/student'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get teacher dashboard data
   */
  getTeacherDashboard: async (): Promise<TeacherDashboard> => {
    try {
      const response = await apiClient.get<ApiResponse<TeacherDashboard>>(
        '/dashboard/teacher'
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get attendance statistics
   */
  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
  }): Promise<AttendanceStats> => {
    try {
      const response = await apiClient.get<ApiResponse<AttendanceStats>>(
        '/dashboard/statistics',
        { params }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
