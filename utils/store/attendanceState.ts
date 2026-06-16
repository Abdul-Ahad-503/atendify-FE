/**
 * Attendance State Management
 * Manages local state for attendance flow per backend specification
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

// State structure per backend specification
export interface ActiveSession {
  meetingId: string;
  courseName: string;
  courseCode: string;
  roomNo: string;
  timeStart: string;
  timeEnd: string;
  enrolledCount: number;
}

export interface LastAttendance {
  attendanceId: string;
  meetingId: string;
  status: "present" | "absent" | "late";
  distance: number;
  withinRadius: boolean;
  radiusMeters: number;
  markedAt: string;
}

export interface HistoryRecord {
  _id: string;
  status: "present" | "absent" | "late";
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
}

export interface Statistics {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number;
  avgDistance: number;
}

export interface AttendanceNotification {
  id: string;
  type: "session_start" | "session_ended" | "attendance_marked";
  title: string;
  body: string;
  data: any;
  timestamp: number;
}

export interface AttendanceState {
  activeSession: ActiveSession | null;
  lastAttendance: LastAttendance | null;
  historyCache: HistoryRecord[];
  statistics: Statistics | null;
  activeNotification: AttendanceNotification | null;
  loading: {
    session: boolean;
    attendance: boolean;
    history: boolean;
    statistics: boolean;
    notification: boolean;
  };
}

const STORAGE_KEYS = {
  ACTIVE_SESSION: "@attendance_active_session",
  LAST_ATTENDANCE: "@attendance_last_attendance",
  HISTORY_CACHE: "@attendance_history_cache",
  STATISTICS: "@attendance_statistics",
  ACTIVE_NOTIFICATION: "@attendance_active_notification",
};

/**
 * Hook for managing attendance state
 */
export const useAttendanceState = () => {
  const [state, setState] = useState<AttendanceState>({
    activeSession: null,
    lastAttendance: null,
    historyCache: [],
    statistics: null,
    activeNotification: null,
    loading: {
      session: false,
      attendance: false,
      history: false,
      statistics: false,
      notification: false,
    },
  });

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const [
        activeSession,
        lastAttendance,
        historyCache,
        statistics,
        notification,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_ATTENDANCE),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY_CACHE),
        AsyncStorage.getItem(STORAGE_KEYS.STATISTICS),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_NOTIFICATION),
      ]);

      setState((prev) => ({
        ...prev,
        activeSession: activeSession ? JSON.parse(activeSession) : null,
        lastAttendance: lastAttendance ? JSON.parse(lastAttendance) : null,
        historyCache: historyCache ? JSON.parse(historyCache) : [],
        statistics: statistics ? JSON.parse(statistics) : null,
        activeNotification: notification ? JSON.parse(notification) : null,
      }));
    } catch (error) {
      console.error("Error loading attendance state:", error);
    }
  };

  // Set active session
  const setActiveSession = useCallback(
    async (session: ActiveSession | null) => {
      setState((prev) => ({ ...prev, activeSession: session }));
      if (session) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACTIVE_SESSION,
          JSON.stringify(session),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    },
    [],
  );

  // Set last attendance
  const setLastAttendance = useCallback(
    async (attendance: LastAttendance | null) => {
      setState((prev) => ({ ...prev, lastAttendance: attendance }));
      if (attendance) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_ATTENDANCE,
          JSON.stringify(attendance),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.LAST_ATTENDANCE);
      }
    },
    [],
  );

  // Add to history cache
  const addToHistoryCache = useCallback(async (record: HistoryRecord) => {
    setState((prev) => {
      const updated = [record, ...prev.historyCache];
      // Keep only last 100 records in cache
      const trimmed = updated.slice(0, 100);
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY_CACHE, JSON.stringify(trimmed));
      return { ...prev, historyCache: trimmed };
    });
  }, []);

  // Clear history cache
  const clearHistoryCache = useCallback(async () => {
    setState((prev) => ({ ...prev, historyCache: [] }));
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY_CACHE);
  }, []);

  // Set statistics
  const setStatistics = useCallback(async (stats: Statistics | null) => {
    setState((prev) => ({ ...prev, statistics: stats }));
    if (stats) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STATISTICS,
        JSON.stringify(stats),
      );
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.STATISTICS);
    }
  }, []);

  // Set notification
  const setActiveNotification = useCallback(
    async (notification: AttendanceNotification | null) => {
      setState((prev) => ({ ...prev, activeNotification: notification }));
      if (notification) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACTIVE_NOTIFICATION,
          JSON.stringify(notification),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_NOTIFICATION);
      }
    },
    [],
  );

  // Set loading state
  const setLoading = useCallback(
    (key: keyof typeof state.loading, value: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [key]: value },
      }));
    },
    [],
  );

  // Clear all state
  const clearAll = useCallback(async () => {
    setState({
      activeSession: null,
      lastAttendance: null,
      historyCache: [],
      statistics: null,
      activeNotification: null,
      loading: {
        session: false,
        attendance: false,
        history: false,
        statistics: false,
        notification: false,
      },
    });
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key)),
    );
  }, []);

  return {
    // State
    state,
    activeSession: state.activeSession,
    lastAttendance: state.lastAttendance,
    historyCache: state.historyCache,
    statistics: state.statistics,
    activeNotification: state.activeNotification,
    loading: state.loading,

    // Actions
    setActiveSession,
    setLastAttendance,
    addToHistoryCache,
    clearHistoryCache,
    setStatistics,
    setActiveNotification,
    setLoading,
    clearAll,
  };
};

/**
 * Singleton state instance for global access
 */
let globalState: ReturnType<typeof useAttendanceState> | null = null;

export const initializeAttendanceState = (
  state: ReturnType<typeof useAttendanceState>,
) => {
  globalState = state;
};

export const getAttendanceState = () => {
  if (!globalState) {
    throw new Error("Attendance state not initialized");
  }
  return globalState;
};
