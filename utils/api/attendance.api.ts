import apiClient, { handleApiError } from "./client";
import {
  ApiResponse,
  AttendancePercentage,
  AttendanceRecord,
  MarkAttendanceRequest,
  MeetingAttendanceReport,
  PaginationInfo,
  StartAttendanceSessionResponse,
  StartSessionRequest,
  StartTeacherSessionRequest,
  TeacherMarkAttendanceRequest,
  TeacherMeeting,
  TeacherSession,
} from "./types";

export const attendanceApi = {
  /**
   * Mark attendance for a student
   */
  markAttendance: async (
    data: MarkAttendanceRequest,
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
        "/attendance/mark",
        {
          courseId: data.courseId,
          sessionId: data.sessionId,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          deviceInfo: data.deviceInfo,
        },
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Mark class attendance (payload capture only)
   */
  markClassAttendance: async (
    data: TeacherMarkAttendanceRequest,
  ): Promise<{ received: boolean }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ received: boolean }>>(
        "/attendance/teacher/mark",
        data,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance history
   */
  getStudentHistory: async (
    studentId: string,
    params?: { page?: number; limit?: number; courseId?: string },
  ): Promise<{
    attendance: AttendanceRecord[];
    pagination: PaginationInfo;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          attendance: AttendanceRecord[];
          pagination: PaginationInfo;
        }>
      >(`/attendance/student/${studentId}/history`, { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance percentages for all courses
   */
  getStudentPercentages: async (
    studentId: string,
  ): Promise<AttendancePercentage[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ percentages: AttendancePercentage[] }>
      >(`/attendance/student/${studentId}/percentages`);

      if (response.data.success && response.data.data) {
        return response.data.data.percentages;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance for a specific course
   */
  getCourseAttendance: async (
    studentId: string,
    courseId: string,
  ): Promise<{
    percentage: AttendancePercentage;
    records: AttendanceRecord[];
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          percentage: AttendancePercentage;
          records: AttendanceRecord[];
        }>
      >(`/attendance/student/${studentId}/course/${courseId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
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
        "/attendance/teacher/start-session",
        data,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
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
        `/attendance/teacher/end-session/${sessionId}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
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
      >("/attendance/teacher/active-sessions");

      if (response.data.success && response.data.data) {
        return response.data.data.sessions;
      }

      throw new Error("Invalid response from server");
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
        `/attendance/session/${sessionId}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Get session history
   */
  getTeacherSessions: async (params?: {
    page?: number;
    limit?: number;
    courseId?: string;
  }): Promise<{ sessions: TeacherSession[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ sessions: TeacherSession[]; pagination: PaginationInfo }>
      >("/attendance/teacher/sessions", { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Fetch today's meetings
   */
  fetchTeacherMeetings: async (): Promise<TeacherMeeting[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          timetable: Record<string, any[]>;
        }>
      >("/teacher/me/timetable"); // removed /api prefix

      if (response.data.success && response.data.data) {
        const timetable = response.data.data.timetable;

        // Get today's day name
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const today = days[new Date().getDay()];

        // Get today's meetings
        const todayMeetings = timetable[today] || [];

        // Map to TeacherMeeting shape
        return todayMeetings.map((m: any) => ({
          meetingId: m.id,
          courseCode: m.courseCode,
          courseName: m.courseName,
          day: today,
          dayOfWeek: new Date().getDay(),
          timeStart: m.timeStart,
          timeEnd: m.timeEnd,
          roomNo: m.roomNo,
          enrolledCount: m.enrolledStudents,
          section: m.section,
          semester: m.semester,
          offeringId: m.offeringId,
        }));
      }

      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Start attendance session
   */
  startAttendanceSession: async (
    data: StartTeacherSessionRequest,
  ): Promise<StartAttendanceSessionResponse> => {
    try {
      const response = await apiClient.post<
        ApiResponse<StartAttendanceSessionResponse>
      >("/attendance/teacher/start", data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to start attendance session",
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Teacher: Get attendance for a meeting
   */
  getMeetingAttendance: async (
    meetingId: string,
  ): Promise<MeetingAttendanceReport> => {
    try {
      const response = await apiClient.get<
        ApiResponse<MeetingAttendanceReport>
      >(`/attendance/meeting/${meetingId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  endAttendanceSession: async (sessionId: string): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/attendance/session/${sessionId}/end`,
        { sessionId },
      );

      if (!response.data.success) {
        throw new Error("Failed to end session");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  markStudentAttendance: async (data: {
    meetingId: string;
    location: { latitude: number; longitude: number };
    radiusMeters?: number;
  }): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse>(
        "/attendance/student/mark",
        data,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to mark attendance");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  checkActiveSession: async (): Promise<{
    activeSession: {
      meetingId: string;
      courseName: string;
      courseCode: string;
      roomNo: string;
      timeStart: string;
      timeEnd: string;
    } | null;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          activeSession: any | null;
        }>
      >(`/attendance/active-sessions`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return { activeSession: null };
    } catch (error) {
      return { activeSession: null };
    }
  },

  /**
   * Get student attendance history
   */
  getStudentHistory: async (params?: {
    termId?: string;
    offeringId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    records: Array<{
      _id: string;
      status: string;
      distanceMeters: number;
      withinRadius: boolean;
      markedAt: string;
      meetingId: {
        day: string;
        timeStart: string;
        timeEnd: string;
        roomNo: string;
      };
      offeringId: {
        courseId: {
          code: string;
          name: string;
        };
      };
    }>;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          total: number;
          records: any[];
        }>
      >(`/attendance/student/history`, { params });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get student attendance statistics for a course
   */
  getAttendanceStats: async (
    offeringId: string,
  ): Promise<{
    totalStudents: number;
    stats: Array<{
      studentId: string;
      student: {
        name: string;
        studentId: string;
      };
      totalClasses: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      avgDistance: number;
      attendancePercentage: number;
    }>;
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          totalStudents: number;
          stats: any[];
        }>
      >(`/attendance/stats/offering/${offeringId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
