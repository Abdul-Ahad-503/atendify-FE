import apiClient, { handleApiError } from "./client";
import { ApiResponse } from "./types";

// Offering Types
export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  // NOTE: if backend returns departmentId instead of department string, change this accordingly
  department?: string;
  departmentId?: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  department?: string;
  departmentId?: string;
  programId?: string;
}

export interface Meeting {
  id?: string;
  day: string;
  slot: number;
  roomNo: string;
  timeStart: string;
  timeEnd: string;
}

export interface CourseOffering {
  id: string;
  termId: string;
  departmentId?: string;
  programId: string;
  semester: number;
  section: string;
  courseId: string;
  status: "draft" | "published";
  meetings: Meeting[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferingRequest {
  termId: string;
  departmentId: string;
  programId: string;
  semester: number;
  section: string;
  // Teacher enters course details; backend should create/find and return courseId on offering
  courseName: string;
  creditHours: number;
}

export interface AddMeetingRequest {
  day: string;
  slot: number;
  roomNo: string;
  timeStart: string;
  timeEnd: string;
}

const mapOffering = (offeringData: any): CourseOffering => {
  return {
    id: offeringData._id || offeringData.id,
    termId: offeringData.termId?._id || offeringData.termId,
    departmentId: offeringData.departmentId?._id || offeringData.departmentId,
    programId: offeringData.programId?._id || offeringData.programId,
    semester: offeringData.semester,
    section: offeringData.section,
    courseId: offeringData.courseId?._id || offeringData.courseId,
    status: offeringData.status,
    meetings: (offeringData.meetings || []).map((m: any) => ({
      id: m._id || m.id,
      day: m.day,
      slot: m.slot,
      roomNo: m.roomNo,
      timeStart: m.timeStart,
      timeEnd: m.timeEnd,
    })),
    createdAt: offeringData.createdAt,
    updatedAt: offeringData.updatedAt,
  };
};

export const offeringApi = {
  getTerms: async (): Promise<Term[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ terms: Term[] }>>("/teacher/terms");
      if (response.data.success && response.data.data)
        return response.data.data.terms;
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPrograms: async (): Promise<Program[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ programs: Program[] }>>(
          "/teacher/programs",
        );
      if (response.data.success && response.data.data)
        return response.data.data.programs;
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCourses: async (): Promise<CourseTemplate[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ courses: CourseTemplate[] }>>(
          "/teacher/courses",
        );
      if (response.data.success && response.data.data)
        return response.data.data.courses;
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createOffering: async (
    data: CreateOfferingRequest,
  ): Promise<CourseOffering> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        "/teacher/offerings",
        data,
      );

      if (response.data.success && response.data.data) {
        const offeringData = response.data.data.offering || response.data.data;
        return mapOffering(offeringData);
      }

      throw new Error(response.data.message || "Failed to create offering");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addMeeting: async (
    offeringId: string,
    meeting: AddMeetingRequest,
  ): Promise<Meeting> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/teacher/offerings/${offeringId}/meetings`,
        meeting,
      );

      if (response.data.success && response.data.data) {
        const m = response.data.data.meeting || response.data.data;
        return {
          id: m._id || m.id,
          day: m.day,
          slot: m.slot,
          roomNo: m.roomNo,
          timeStart: m.timeStart,
          timeEnd: m.timeEnd,
        };
      }

      throw new Error(response.data.message || "Failed to add meeting");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add meeting";
      throw new Error(errorMsg);
    }
  },

  updateMeeting: async (
    offeringId: string,
    meetingId: string,
    meeting: AddMeetingRequest,
  ): Promise<Meeting> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/teacher/offerings/${offeringId}/meetings/${meetingId}`,
        meeting,
      );

      if (response.data.success && response.data.data) {
        const m = response.data.data.meeting || response.data.data;
        return {
          id: m._id || m.id,
          day: m.day,
          slot: m.slot,
          roomNo: m.roomNo,
          timeStart: m.timeStart,
          timeEnd: m.timeEnd,
        };
      }

      throw new Error(response.data.message || "Failed to update meeting");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteMeeting: async (
    offeringId: string,
    meetingId: string,
  ): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/teacher/offerings/${offeringId}/meetings/${meetingId}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete meeting");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  publishOffering: async (offeringId: string): Promise<CourseOffering> => {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/teacher/offerings/${offeringId}/publish`,
      );

      if (response.data.success && response.data.data) {
        const offeringData = response.data.data.offering || response.data.data;
        return mapOffering(offeringData);
      }

      throw new Error(response.data.message || "Failed to publish offering");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getOffering: async (offeringId: string): Promise<CourseOffering> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/teacher/offerings/${offeringId}`,
      );

      if (response.data.success && response.data.data) {
        const offeringData = response.data.data.offering || response.data.data;
        return mapOffering(offeringData);
      }

      throw new Error(response.data.message || "Offering not found");
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMyOfferings: async (): Promise<CourseOffering[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ offerings: any[] }>>(
          "/teacher/offerings",
        );

      if (response.data.success && response.data.data) {
        return (response.data.data.offerings || []).map(mapOffering);
      }

      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
