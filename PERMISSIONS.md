# Permissions Setup Flow

## Overview

GeoAttend implements a comprehensive 4-step permission setup flow that appears after first login or signup. This ensures all necessary permissions are granted for reliable location-based attendance tracking.

## Permission Flow

### Step 1: Location Permission

**File**: `app/permissions/location.tsx`

- **Permission**: Foreground location access
- **Why needed**: To verify user is within classroom range
- **Features**:
  - Request location permission
  - Show permission status (Required/Granted)
  - Display reasons for needing permission
  - Handle permission denial gracefully

### Step 2: Background Location

**File**: `app/permissions/background.tsx`

- **Permission**: Background location access
- **Why needed**: Automatic attendance tracking when app is closed
- **Features**:
  - Request background location permission
  - Explain battery-efficient tracking
  - Auto check-in/check-out capability

### Step 3: Battery Optimization

**File**: `app/permissions/battery.tsx`

- **Permission**: Disable battery optimization (Android)
- **Why needed**: Prevent system from stopping location tracking
- **Features**:
  - Guide user to battery settings (Android)
  - Automatic on iOS
  - Skip option available

### Step 4: Device Information

**File**: `app/permissions/device.tsx`

- **Permission**: Basic device info access
- **Why needed**: Unique identification and fraud prevention
- **Features**:
  - Explain data collection
  - Privacy and security information
  - Complete setup and save onboarding state

## Implementation Details

### Navigation Flow

```
Login/Signup → Check AsyncStorage
  ↓
  ├─ onboarding_completed = true → Main App (Tabs)
  └─ onboarding_completed = false → Permissions Flow
      ↓
      Step 1 (Location) → Step 2 (Background) → Step 3 (Battery) → Step 4 (Device)
      ↓
      Save onboarding_completed = true → Main App (Tabs)
```

### State Management

- **Storage**: `@react-native-async-storage/async-storage`
- **Key**: `onboarding_completed`
- **Values**: `'true'` | `null`

### Permission Libraries

- **Location**: `expo-location`
  - Foreground permissions: `requestForegroundPermissionsAsync()`
  - Background permissions: `requestBackgroundPermissionsAsync()`

### UI Components

- **Stepper**: Visual progress indicator (1/4, 2/4, 3/4, 4/4)
- **Status Badge**: Shows "Required" (orange) or "Granted" (green)
- **Info Boxes**: Explain why each permission is needed
- **Action Buttons**: Back and Next/Grant Permission

## Testing the Flow

### Reset Onboarding (for testing)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Reset onboarding to test flow again
await AsyncStorage.removeItem("onboarding_completed");
```

### Check Permission Status

```typescript
import * as Location from "expo-location";

// Check foreground permission
const { status } = await Location.getForegroundPermissionsAsync();

// Check background permission
const { status } = await Location.getBackgroundPermissionsAsync();
```

## Configuration Files

### app.json

Location permissions configured with proper descriptions:

```json
{
  "plugins": [
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "...",
        "isIosBackgroundLocationEnabled": true,
        "isAndroidBackgroundLocationEnabled": true
      }
    ]
  ]
}
```

### iOS Info.plist Keys

- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `NSLocationAlwaysUsageDescription`

### Android Permissions

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`

## Permission Utility Functions

Located in `utils/permissions.ts`:

```typescript
// Check if onboarding completed
await checkOnboardingCompleted();

// Mark onboarding as completed
await setOnboardingCompleted();

// Reset onboarding (testing)
await resetOnboarding();

// Check location permission
await checkLocationPermission();

// Request location permission
await requestLocationPermission();

// Check all permissions
await checkAllPermissions();

// Get current location
await getCurrentLocation();

// Watch location continuously
await watchLocation(callback);
```

## User Experience

1. **First Login/Signup**: User sees full 4-step permission flow
2. **Subsequent Logins**: User goes directly to main app
3. **Permission Denied**: User can retry or skip (with warnings)
4. **Clear Progress**: Stepper shows current step and completed steps
5. **Informative**: Each screen explains why permission is needed

## Security & Privacy

- ✅ Permissions requested only when needed
- ✅ Clear explanations for each permission
- ✅ Privacy notice on device info screen
- ✅ Data encryption mentioned
- ✅ No third-party sharing statement
- ✅ User can understand what's being collected

## Future Enhancements

- [ ] Add "Skip for now" option with limitations
- [ ] Implement permission re-request from settings
- [ ] Add analytics for permission grant rates
- [ ] Create admin dashboard to see permission stats
- [ ] Add notification permission step
- [ ] Implement permission status check on app resume
