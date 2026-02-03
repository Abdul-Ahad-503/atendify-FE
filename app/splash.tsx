import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulate loading/initialization
    const timer = setTimeout(() => {
      // Navigate to login screen after splash
      router.replace("/auth/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <MaterialIcons name="location-on" size={48} color="#2563EB" />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>GeoAttend</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Location-Based Attendance</Text>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.2 - Initializing...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 48,
  },
  loadingContainer: {
    marginVertical: 32,
  },
  version: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
  },
});
