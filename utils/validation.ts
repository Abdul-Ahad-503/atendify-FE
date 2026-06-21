import { Alert } from 'react-native';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

export const validateStudentId = (studentId: string): boolean => {
  return studentId.trim().length >= 3;
};

export const validateMeetingId = (meetingId: string): boolean => {
  return meetingId.trim().length > 0;
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const validateSection = (section: string): boolean => {
  const sectionRegex = /^[A-Z]$/;
  return sectionRegex.test(section);
};

export const validateSectionList = (sections: string[]): boolean => {
  return sections.every(section => validateSection(section));
};

export const validateCourseCode = (code: string): boolean => {
  const codeRegex = /^[A-Z]{2,4}-\d{4}$/;
  return codeRegex.test(code);
};

export const validateCourseName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateRoomNumber = (room: string): boolean => {
  return room.trim().length >= 1;
};

export const validateLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

export const validateLongitude = (lon: number): boolean => {
  return lon >= -180 && lon <= 180;
};

export const validateLocation = (lat: number, lon: number): boolean => {
  return validateLatitude(lat) && validateLongitude(lon);
};

export const validateMeetingData = (data: {
  day: string;
  slot: number;
  roomNo: string;
  timeStart: string;
  timeEnd: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate day
  if (!data.day || !['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(data.day)) {
    errors.push('Invalid day of week');
  }

  // Validate slot
  if (!data.slot || data.slot < 1 || data.slot > 12) {
    errors.push('Slot must be between 1 and 12');
  }

  // Validate room number
  if (!data.roomNo || data.roomNo.trim().length === 0) {
    errors.push('Room number is required');
  }

  // Validate time start
  if (!data.timeStart || !validateTime(data.timeStart)) {
    errors.push('Invalid start time format (HH:MM)');
  }

  // Validate time end
  if (!data.timeEnd || !validateTime(data.timeEnd)) {
    errors.push('Invalid end time format (HH:MM)');
  }

  // Validate time range
  if (data.timeStart && data.timeEnd) {
    const startMinutes = timeToMinutes(data.timeStart);
    const endMinutes = timeToMinutes(data.timeEnd);
    if (startMinutes >= endMinutes) {
      errors.push('End time must be after start time');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAttendanceData = (data: {
  meetingId: string;
  location: { latitude: number; longitude: number };
}): ValidationResult => {
  const errors: string[] = [];

  // Validate meeting ID
  if (!data.meetingId || data.meetingId.trim().length === 0) {
    errors.push('Meeting ID is required');
  }

  // Validate location
  if (!data.location || !data.location.latitude || !data.location.longitude) {
    errors.push('Location is required');
  }

  if (!validateLocation(data.location.latitude, data.location.longitude)) {
    errors.push('Invalid location coordinates');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCourseOfferingData = (data: {
  termId: string;
  departmentId: string;
  programId: string;
  semester: number;
  section: string;
  courseName: string;
  creditHours: number;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate term ID
  if (!data.termId || data.termId.trim().length === 0) {
    errors.push('Term ID is required');
  }

  // Validate department ID
  if (!data.departmentId || data.departmentId.trim().length === 0) {
    errors.push('Department ID is required');
  }

  // Validate program ID
  if (!data.programId || data.programId.trim().length === 0) {
    errors.push('Program ID is required');
  }

  // Validate semester
  if (!data.semester || data.semester < 1 || data.semester > 8) {
    errors.push('Semester must be between 1 and 8');
  }

  // Validate section
  if (!data.section || !validateSection(data.section)) {
    errors.push('Section must be a single uppercase letter (A-Z)');
  }

  // Validate course name
  if (!data.courseName || !validateCourseName(data.courseName)) {
    errors.push('Course name is required');
  }

  // Validate credit hours
  if (!data.creditHours || data.creditHours < 1 || data.creditHours > 6) {
    errors.push('Credit hours must be between 1 and 6');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginData = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate email
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  // Validate password
  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegistrationData = (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
  programId?: string;
  semester?: number;
  section?: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate name
  if (!data.name || !validateName(data.name)) {
    errors.push('Name must be at least 2 characters long');
  }

  // Validate email
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  // Validate password
  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate role
  if (!data.role || !['student', 'teacher'].includes(data.role)) {
    errors.push('Invalid role');
  }

  // Validate student-specific fields
  if (data.role === 'student') {
    if (!data.programId) {
      errors.push('Program ID is required for students');
    }
    if (!data.semester) {
      errors.push('Semester is required for students');
    }
    if (!data.section) {
      errors.push('Section is required for students');
    }
  }

  // Validate teacher-specific fields
  if (data.role === 'teacher') {
    if (!data.departmentId) {
      errors.push('Department ID is required for teachers');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRadius = (radius: number): boolean => {
  return validateRange(radius, 5, 30);
};

export const validateSessionData = (data: {
  meetingId: string;
  location: { latitude: number; longitude: number };
  radiusMeters?: number;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate meeting ID
  if (!data.meetingId || data.meetingId.trim().length === 0) {
    errors.push('Meeting ID is required');
  }

  // Validate location
  if (!data.location || !data.location.latitude || !data.location.longitude) {
    errors.push('Location is required');
  }

  if (!validateLocation(data.location.latitude, data.location.longitude)) {
    errors.push('Invalid location coordinates');
  }

  // Validate radius
  if (data.radiusMeters !== undefined && !validateRadius(data.radiusMeters)) {
    errors.push('Radius must be between 5 and 30 meters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to show validation errors
export const showValidationErrors = (errors: string[]) => {
  Alert.alert(
    'Validation Error',
    errors[0],
    [{ text: 'OK' }]
  );
};

// Helper function to validate and show errors
export const validateAndShowErrors = (validationResult: ValidationResult): boolean => {
  if (!validationResult.isValid) {
    showValidationErrors(validationResult.errors);
    return false;
  }
  return true;
};