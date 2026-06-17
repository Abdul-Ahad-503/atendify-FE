import { Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastConfig = { message: string; type: ToastType };

const COLORS: Record<ToastType, string> = {
  success: "#10B981",
  error: "#EF4444",
  info: "#6366F1",
  warning: "#F59E0B",
};

const ICONS: Record<ToastType, any> = {
  success: "check-circle",
  error: "error",
  info: "info",
  warning: "warning",
};

/**
 * Simple toast hook. Renders a floating bar at the bottom of the screen.
 * Usage inside any screen:
 *   const { show, ToastComponent } = useSimpleToast();
 *   show("Attendance marked!", "success");
 *   // ... in JSX: {ToastComponent}
 */
export function useSimpleToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const show = (message: string, type: ToastType = "info") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3000);
  };

  const ToastComponent = toast ? (
    <View style={styles.toastContainer}>
      <View style={[styles.toast, { borderLeftColor: COLORS[toast.type], backgroundColor: toast.type === "error" ? "#FEF2F2" : toast.type === "success" ? "#ECFDF5" : toast.type === "warning" ? "#FFFBEB" : "#EEF2FF" }]}>
        <MaterialIcons name={ICONS[toast.type]} size={18} color={COLORS[toast.type]} />
        <Text style={[styles.toastMsg, { color: COLORS[toast.type] }]}>{toast.message}</Text>
      </View>
    </View>
  ) : null;

  return { show, ToastComponent };
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 100,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  toastMsg: {
    ...Typography.body,
    fontWeight: "500",
    flex: 1,
  },
});
