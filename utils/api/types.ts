// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit?: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  rollNumber?: string;
  employeeId?: string;
  department?: string;
  semester?: number;
  isActive: boolean;
  enrolledCourses?: Course[];
  teachingCourses?: Course[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Course Types
export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  creditHours: number;
  teacher: User | string;
  students?: User[];
  room?: Room;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  geofenceRadius: number;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  creditHours: number;
}

// Timetable Types
export interface TimetableEntry {
  section: string;
  programCode: string;
  id: string;
  course: Course;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  room: Room;
  subject: Subject;
  teacher: User;
  isActive: boolean;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  student: User | string;
  course: Course | string;
  session: TeacherSession | string;
  status: "present" | "absent" | "late" | "excused";
  markedAt: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  distance?: number;
  ipAddress?: string;
  deviceInfo?: string;
  remarks?: string;
  createdAt: string;
}

export interface TeacherSession {
  id: string;
  teacher: User | string;
  course: Course | string;
  timetableEntry: TimetableEntry | string;
  startTime: string;
  endTime?: string;
  room: Room;
  sessionDate: string;
  isActive: boolean;
  totalStudentsEnrolled: number;
  totalPresent?: number;
  totalAbsent?: number;
  attendanceMarked?: AttendanceRecord[];
  createdAt: string;
}

export interface AttendancePercentage {
  id: string;
  student: User | string;
  course: Course | string;
  totalClasses: number;
  classesAttended: number;
  percentage: number;
  status: "good" | "warning" | "critical";
  lastUpdated: string;
}

// Dashboard Types
export interface StudentDashboard {
  upcomingClasses: TimetableEntry[];
  todayClasses: TimetableEntry[];
  attendanceOverview: AttendancePercentage[];
  recentAttendance: AttendanceRecord[];
  notifications: Notification[];
  stats: {
    totalCourses: number;
    averageAttendance: number;
    presentToday: number;
    criticalCourses: number;
  };
}

export interface TeacherDashboard {
  upcomingClasses: TimetableEntry[];
  todayClasses: TimetableEntry[];
  activeSessions: TeacherSession[];
  recentSessions: TeacherSession[];
  notifications: Notification[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    classesToday: number;
    avgAttendance: number;
    totalPresentToday: number;
    activeSessionsCount: number;
  };
}

export interface AttendanceStats {
  courseWiseAttendance: {
    course: Course;
    percentage: number;
    present: number;
    absent: number;
    total: number;
  }[];
  monthlyTrend: {
    month: string;
    percentage: number;
    present: number;
    absent: number;
    total: number;
  }[];
  weeklyTrend: {
    day: string;
    percentage: number;
    present: number;
    absent: number;
  }[];
  overallStats: {
    totalClasses: number;
    totalPresent: number;
    totalAbsent: number;
    averagePercentage: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  user: User | string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high";
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher";
  departmentId: string;
  // Student fields
  programId?: string;
  rollNumber?: string;
  studentId?: string;
  semester?: number;
  section?: string;
  department?: string;
  program?: string;
  shift?: "MORNING" | "EVENING";
  // Teacher fields
  employeeId?: string;
}

export interface MarkAttendanceRequest {
  courseId: string;
  sessionId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
}

export interface TeacherMarkAttendanceRequest {
  classId: string;
  courseId: string;
  details: {
    courseName?: string;
    courseCode?: string;
    subjectName?: string;
    subjectCode?: string;
    roomNumber?: string;
    programCode?: string;
    section?: string;
    semester?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
  deviceInfo?: string;
}

export interface StartSessionRequest {
  timetableEntryId: string;
  roomId: string;
}

// Teacher Attendance Types
export interface TeacherMeeting {
  meetingId: string;
  courseCode: string;
  courseName: string;
  day: string;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  roomNo: string;
  enrolledCount: number;
  section: string;
  semester: number;
  offeringId: string;
  timetableEntryId?: string;
}

export interface StartAttendanceSessionResponse {
  sessionId: string;
  meetingId: string;
  enrolledStudentsCount: number;
  studentsToNotify: Array<{
    studentId: string;
    name: string;
    email: string;
  }>;
  teacherLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface MeetingAttendanceSummary {
  present: number;
  absent: number;
  total: number;
  avgDistance: number;
  sessionId: string;
  isActive: boolean;
}

export interface MeetingAttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
    email: string;
  };
  status: "present" | "absent" | "late";
  markedAt: string;
  distanceMeters: number;
  withinRadius: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MeetingAttendanceReport {
  summary: MeetingAttendanceSummary;
  records: MeetingAttendanceRecord[];
}

export interface StartTeacherSessionRequest {
  meetingId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  details: {
    courseName: string;
    courseCode: string;
    roomNumber: string;
    section: string;
    semester: number;
    enrolledCount: number;
    timeStart?: string;
    timeEnd?: string;
  };
  deviceInfo?: string;
}

export interface MarkAttendanceResponse {
  attendanceId: string;
  status: 'present' | 'absent' | 'late';
  distance: string;
  withinRadius: boolean;
  radiusMeters: number;
  markedAt: string;
}

export interface PushTokenRequest {
  pushToken: string;
}
