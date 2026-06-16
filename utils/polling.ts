/**
 * Polling utilities for real-time attendance updates
 * Based on backend specification fallback mechanism
 */

import { attendanceApi } from "@/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";

export interface PollConfig {
  interval: number; // Milliseconds
  maxAttempts?: number; // Undefined = infinite
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onAttempt?: (attempt: number) => void;
}

/**
 * Hook for polling active sessions
 * Checks for new attendance sessions periodically
 */
export const useActiveSessionPoller = (
  enabled: boolean = true,
  interval: number = 10000, // 10 seconds default
) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const poll = useCallback(async () => {
    try {
      const result = await attendanceApi.checkActiveSession();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Polling failed"));
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    // Poll immediately first time
    poll();

    // Then poll periodically
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, poll]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPolling(false);
  }, []);

  return {
    data: data?.activeSession || null,
    error,
    isPolling,
    stop,
    poll,
  };
};

/**
 * Hook for polling meeting attendance count
 * Used for real-time updates during active session
 */
export const useMeetingAttendancePoller = (
  meetingId: string | null,
  enabled: boolean = true,
  interval: number = 5000, // 5 seconds default
) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const poll = useCallback(async () => {
    if (!meetingId) return;

    try {
      const result = await attendanceApi.getMeetingAttendance(meetingId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Polling failed"));
    }
  }, [meetingId]);

  useEffect(() => {
    if (!enabled || !meetingId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    // Poll immediately first time
    poll();

    // Then poll periodically
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, meetingId, interval, poll]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPolling(false);
  }, []);

  return {
    data,
    error,
    isPolling,
    stop,
    poll,
  };
};

/**
 * Generic polling hook for custom endpoints
 */
export const usePoller = <T>(fetchFn: () => Promise<T>, config: PollConfig) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const poll = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);

      if (config.onSuccess) {
        config.onSuccess(result);
      }

      // Reset attempt counter on success
      setAttempt(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Polling failed");
      setError(error);

      if (config.onError) {
        config.onError(error);
      }

      setAttempt((prev) => prev + 1);
    }
  }, [fetchFn, config]);

  useEffect(() => {
    setIsPolling(true);

    // Poll immediately first time
    poll();

    // Check if max attempts exceeded
    if (config.maxAttempts && attempt >= config.maxAttempts) {
      setIsPolling(false);
      return;
    }

    // Then poll periodically
    intervalRef.current = setInterval(poll, config.interval);

    if (config.onAttempt) {
      config.onAttempt(attempt);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [attempt, poll, config]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPolling(false);
  }, []);

  return {
    data,
    error,
    isPolling,
    attempt,
    stop,
    poll,
  };
};

/**
 * Exponential backoff polling configuration
 * Useful for handling rate limits
 */
export const exponentialBackoffConfig = (
  baseInterval: number,
  maxInterval: number = 60000,
): PollConfig => ({
  interval: baseInterval,
  onAttempt: (attempt) => {
    // Calculate exponential backoff
    const backoff = Math.min(baseInterval * Math.pow(2, attempt), maxInterval);
    console.log(`Polling attempt ${attempt + 1}, next interval: ${backoff}ms`);
  },
});
