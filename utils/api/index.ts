// Export all API services
export { attendanceApi } from "./attendance.api";
export { authApi } from "./auth.api";
export { default as apiClient, handleApiError } from "./client";
export * from "./config";
export { courseApi } from "./course.api";
export { dashboardApi } from "./dashboard.api";
export { notificationApi } from "./notification.api";
export { offeringApi } from "./offering.api";
export type {
    AddMeetingRequest,
    CourseOffering,
    CourseTemplate,
    CreateOfferingRequest,
    Meeting,
    Program,
    Term
} from "./offering.api";
export { timetableApi } from "./timetable.api";
export type { TimetableEntry, WeeklyTimetable } from "./timetable.api";
export * from "./types";

