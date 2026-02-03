import apiClient, { handleApiError } from './client';
import {
  ApiResponse,
  Course,
  PaginationInfo,
  TimetableEntry,
} from './types';

export const courseApi = {
  /**
   * Get all courses
   */
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    semester?: number;
  }): Promise<{ courses: Course[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ courses: Course[]; pagination: PaginationInfo }>
      >('/courses', { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (courseId: string): Promise<Course> => {
    try {
      const response = await apiClient.get<ApiResponse<{ course: Course }>>(
        `/courses/${courseId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.course;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student's enrolled courses
   */
  getStudentCourses: async (studentId: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{ courses: Course[] }>>(
        `/courses/student/${studentId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.courses;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get teacher's teaching courses
   */
  getTeacherCourses: async (teacherId: string): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{ courses: Course[] }>>(
        `/courses/teacher/${teacherId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.courses;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get timetable for a user
   */
  getTimetable: async (params?: {
    day?: number;
    courseId?: string;
  }): Promise<TimetableEntry[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ timetable: TimetableEntry[] }>
      >('/courses/timetable', { params });

      if (response.data.success && response.data.data) {
        return response.data.data.timetable;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get today's classes
   */
  getTodayClasses: async (): Promise<TimetableEntry[]> => {
    try {
      const today = new Date().getDay(); // 0-6
      const response = await apiClient.get<
        ApiResponse<{ timetable: TimetableEntry[] }>
      >('/courses/timetable', { params: { day: today } });

      if (response.data.success && response.data.data) {
        return response.data.data.timetable;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
