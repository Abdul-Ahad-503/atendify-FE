import apiClient, { handleApiError } from './client';
import {
  ApiResponse,
  AttendancePercentage,
  AttendanceRecord,
  MarkAttendanceRequest,
  PaginationInfo,
  StartSessionRequest,
  TeacherSession,
} from './types';

export const attendanceApi = {
  /**
   * Mark attendance for a student
   */
  markAttendance: async (
    data: MarkAttendanceRequest
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
        '/attendance/mark',
        {
          courseId: data.courseId,
          sessionId: data.sessionId,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          deviceInfo: data.deviceInfo,
        }
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
   * Get student attendance history
   */
  getStudentHistory: async (
    studentId: string,
    params?: { page?: number; limit?: number; courseId?: string }
  ): Promise<{ attendance: AttendanceRecord[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ attendance: AttendanceRecord[]; pagination: PaginationInfo }>
      >(`/attendance/student/${studentId}/history`, { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance percentages for all courses
   */
  getStudentPercentages: async (
    studentId: string
  ): Promise<AttendancePercentage[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ percentages: AttendancePercentage[] }>
      >(`/attendance/student/${studentId}/percentages`);

      if (response.data.success && response.data.data) {
        return response.data.data.percentages;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance for a specific course
   */
  getCourseAttendance: async (
    studentId: string,
    courseId: string
  ): Promise<{ percentage: AttendancePercentage; records: AttendanceRecord[] }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ percentage: AttendancePercentage; records: AttendanceRecord[] }>
      >(`/attendance/student/${studentId}/course/${courseId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Start a new session
   */
  startSession: async (data: StartSessionRequest): Promise<TeacherSession> => {
    try {
      const response = await apiClient.post<ApiResponse<TeacherSession>>(
        '/attendance/teacher/start-session',
        data
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
   * Teacher: End a session
   */
  endSession: async (sessionId: string): Promise<TeacherSession> => {
    try {
      const response = await apiClient.put<ApiResponse<TeacherSession>>(
        `/attendance/teacher/end-session/${sessionId}`
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
   * Teacher: Get active sessions
   */
  getActiveSessions: async (): Promise<TeacherSession[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ sessions: TeacherSession[] }>
      >('/attendance/teacher/active-sessions');

      if (response.data.success && response.data.data) {
        return response.data.data.sessions;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Get session details with attendance
   */
  getSessionDetails: async (sessionId: string): Promise<TeacherSession> => {
    try {
      const response = await apiClient.get<ApiResponse<TeacherSession>>(
        `/attendance/session/${sessionId}`
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
   * Teacher: Get session history
   */
  getTeacherSessions: async (
    params?: { page?: number; limit?: number; courseId?: string }
  ): Promise<{ sessions: TeacherSession[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ sessions: TeacherSession[]; pagination: PaginationInfo }>
      >('/attendance/teacher/sessions', { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
