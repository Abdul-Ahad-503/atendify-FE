import apiClient, { handleApiError } from "./client";
import { ApiResponse } from "./types";

// Timetable Types
export interface TimetableEntry {
  id: string;
  courseName: string;
  courseCode: string;
  slot: number;
  timeStart: string;
  timeEnd: string;
  roomNo: string;
  offeringId: string;
  meetingType?: string;
  // Teacher-specific
  teacherName?: string;
  // Student-specific
  programCode?: string;
  semester?: number;
  section?: string;
  enrolledStudents?: number;
}

export interface WeeklyTimetable {
  Monday: TimetableEntry[];
  Tuesday: TimetableEntry[];
  Wednesday: TimetableEntry[];
  Thursday: TimetableEntry[];
  Friday: TimetableEntry[];
  Saturday: TimetableEntry[];
  Sunday?: TimetableEntry[]; // Optional, in case Sunday classes are added in the future
}

export interface StudentCohortTimetableRequest {
  program: string;
  semester: number;
  section: string;
  termId?: string;
}

const mapByDayToWeeklyTimetable = (byDay: any): WeeklyTimetable => {
  const mapEntries = (entries: any[]): TimetableEntry[] =>
    (entries || []).map((e: any) => ({
      id: e.id,
      courseName: e.course?.name ?? "",
      courseCode: e.course?.code ?? "",
      slot: e.slot,
      timeStart: e.timeStart,
      timeEnd: e.timeEnd,
      roomNo: e.roomNo,
      offeringId: e.offeringId ?? "",
      teacherName: e.teacher?.name,
    }));

  return {
    Monday: mapEntries(byDay?.Monday),
    Tuesday: mapEntries(byDay?.Tuesday),
    Wednesday: mapEntries(byDay?.Wednesday),
    Thursday: mapEntries(byDay?.Thursday),
    Friday: mapEntries(byDay?.Friday),
    Saturday: mapEntries(byDay?.Saturday),
    Sunday: mapEntries(byDay?.Sunday),
  };
};

export const timetableApi = {
  /**
   * Get teacher's timetable
   */
  getTeacherTimetable: async (): Promise<WeeklyTimetable> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ timetable: WeeklyTimetable }>
      >("/teacher/me/timetable");

      if (response.data.success && response.data.data) {
        return response.data.data.timetable;
      }

      throw new Error("Failed to load timetable");
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get student's timetable by cohort
   * Uses: POST /student/timetable/by-cohort
   */
  getStudentTimetableByCohort: async (
    payload: StudentCohortTimetableRequest,
  ): Promise<WeeklyTimetable> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        "/student/timetable/by-cohort",
        payload,
      );

      if (response.data.success && response.data.data?.byDay) {
        return mapByDayToWeeklyTimetable(response.data.data.byDay);
      }

      throw new Error("Failed to load timetable");
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Previous endpoint (kept for reference)
   * GET /student/me/timetable
   */
  // getStudentTimetable: async (termId?: string): Promise<WeeklyTimetable> => {
  //   try {
  //     const response = await apiClient.get<ApiResponse<any>>(
  //       "/student/me/timetable",
  //       {
  //         params: termId ? { termId } : undefined,
  //       },
  //     );
  //
  //     if (response.data.success && response.data.data?.byDay) {
  //       return mapByDayToWeeklyTimetable(response.data.data.byDay);
  //     }
  //
  //     throw new Error("Failed to load timetable");
  //   } catch (error) {
  //     throw handleApiError(error);
  //   }
  // },
};
