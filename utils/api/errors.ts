/**
 * Comprehensive error handling for attendance API
 * Based on backend specification error codes and scenarios
 */

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
}

export class AttendanceError extends Error {
  constructor(
    public code: string,
    public message: string,
    public httpCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = "AttendanceError";
  }
}

/**
 * Parse API error response and convert to user-friendly message
 */
export const parseAttendanceError = (error: any): AttendanceError => {
  // Handle axios errors
  if (error.response?.status) {
    const status = error.response.status;
    const data = error.response.data;

    // Extract error message
    const message = data?.message || data?.error || "Unknown error occurred";
    const code = data?.code || `HTTP_${status}`;

    switch (status) {
      case 400:
        // Bad request - validation errors
        return new AttendanceError(
          "VALIDATION_ERROR",
          message || "Invalid request. Please check your input.",
          400,
          data?.details,
        );

      case 401:
        // Unauthorized
        return new AttendanceError(
          "UNAUTHORIZED",
          "Session expired. Please log in again.",
          401,
        );

      case 403:
        // Forbidden - enrollment or permission issues
        return new AttendanceError(
          code || "FORBIDDEN",
          message || "You don't have permission to perform this action.",
          403,
        );

      case 404:
        // Not found
        return new AttendanceError(
          "NOT_FOUND",
          message || "Resource not found.",
          404,
        );

      case 409:
        // Conflict - already marked, active session issues
        return new AttendanceError(
          code || "CONFLICT",
          message ||
            "Attendance already marked for this class or session not active.",
          409,
        );

      case 422:
        // Unprocessable entity - semantic errors (distance, enrollment)
        return new AttendanceError(
          code || "UNPROCESSABLE_ENTITY",
          message || "Unable to process attendance.",
          422,
          data?.details,
        );

      case 500:
        // Server error
        return new AttendanceError(
          "SERVER_ERROR",
          "Server error. Please try again later.",
          500,
        );

      default:
        return new AttendanceError(
          `HTTP_${status}`,
          message || `Error: ${status}`,
          status,
        );
    }
  }

  // Handle network errors
  if (error.message === "Network Error") {
    return new AttendanceError(
      "NETWORK_ERROR",
      "Unable to connect to server. Please check your internet connection.",
    );
  }

  if (error.code === "ECONNABORTED") {
    return new AttendanceError(
      "TIMEOUT_ERROR",
      "Request took too long. Please try again.",
    );
  }

  // Handle custom errors
  if (error instanceof AttendanceError) {
    return error;
  }

  // Generic error
  return new AttendanceError(
    "UNKNOWN_ERROR",
    error.message || "An unexpected error occurred.",
  );
};

/**
 * User-facing error messages for common scenarios
 */
export const getErrorMessage = (error: AttendanceError | any): string => {
  if (error instanceof AttendanceError) {
    switch (error.code) {
      case "GPS_PERMISSION_DENIED":
        return "GPS permission is required. Please enable it in settings to mark attendance.";

      case "GPS_LOCATION_UNAVAILABLE":
        return "Unable to get your location. Please check GPS and try again.";

      case "GPS_TIMEOUT":
        return "GPS took too long to get your location. Please try again.";

      case "NOT_ENROLLED":
      case "ENROLLMENT_ERROR":
        return "You are not enrolled in this course. Please contact your instructor.";

      case "NO_ACTIVE_SESSION":
      case "SESSION_NOT_STARTED":
        return "Your teacher has not started the attendance session yet. Please wait.";

      case "ALREADY_MARKED":
        return "You have already marked attendance for this class.";

      case "OUTSIDE_RADIUS":
        return "You are too far from the classroom. Please move closer to mark attendance.";

      case "DEVICE_OFFLINE":
        return "You are offline. Please connect to the internet and try again.";

      case "VALIDATION_ERROR":
        return `Invalid data: ${error.message}`;

      case "UNAUTHORIZED":
        return "Your session has expired. Please log in again.";

      case "FORBIDDEN":
        return "You don't have permission to perform this action.";

      case "NETWORK_ERROR":
        return "Network connection failed. Please check your internet.";

      case "TIMEOUT_ERROR":
        return "Request timed out. Please try again.";

      case "SERVER_ERROR":
        return "Server is temporarily unavailable. Please try again later.";

      default:
        return error.message || "An error occurred. Please try again.";
    }
  }

  return "An unexpected error occurred.";
};

/**
 * Determine if error is retry-able
 */
export const isRetryableError = (error: AttendanceError | any): boolean => {
  if (error instanceof AttendanceError) {
    const retryableCodes = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "SERVER_ERROR",
      "GPS_TIMEOUT",
      "DEVICE_OFFLINE",
    ];
    return retryableCodes.includes(error.code);
  }
  return false;
};

/**
 * Check if error requires re-authentication
 */
export const requiresReAuth = (error: AttendanceError | any): boolean => {
  if (error instanceof AttendanceError) {
    return error.code === "UNAUTHORIZED";
  }
  return false;
};

/**
 * Check if error is GPS-related
 */
export const isGpsError = (error: AttendanceError | any): boolean => {
  if (error instanceof AttendanceError) {
    return error.code.startsWith("GPS_");
  }
  return false;
};
