/**
 * AttendX Design System
 * Based on design.md configuration
 */

import { Platform } from "react-native";

// Design System Colors
export const Colors = {
  // Primary Colors
  primary: "#2563EB",
  primaryHover: "#1E40AF",
  secondary: "#14B8A6",

  // Background & Surface
  background: "#F8FAFC",
  surface: "#FFFFFF",

  // Text Colors
  textPrimary: "#0F172A",
  textSecondary: "#475569",

  // Borders & Dividers
  border: "#E2E8F0",

  // Status Colors
  success: "#22C55E",
  warning: "#FACC15",
  error: "#EF4444",

  // Icon Colors
  icon: "#475569",

  // Light Theme
  light: {
    text: "#0F172A",
    textSecondary: "#475569",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    tint: "#2563EB",
    icon: "#475569",
    tabIconDefault: "#475569",
    tabIconSelected: "#2563EB",
    border: "#E2E8F0",
  },

  // Dark Theme (Optional)
  dark: {
    text: "#E5E7EB",
    textSecondary: "#94A3B8",
    background: "#020617",
    surface: "#020617",
    tint: "#3B82F6",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#3B82F6",
    border: "#1E293B",
  },
};

// Typography
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "600" as const,
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 29,
  },
  h3: {
    fontSize: 20,
    fontWeight: "500" as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 21,
  },
  extraSmall: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
};

// Spacing System (8px Grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  button: 8,
  card: 12,
  input: 8,
};

// Shadows
export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 5,
  },
  input: {
    shadowColor: "rgba(37, 99, 235, 0.2)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
