# Permission Setup - Quick Reference

## 📱 User Flow

```
Splash (3s) → Login → Permission Check
                ↓
    First Time User          Returning User
         ↓                        ↓
    Permissions Flow         Main App (Tabs)
         ↓
    Step 1: Location
         ↓
    Step 2: Background
         ↓
    Step 3: Battery
         ↓
    Step 4: Device
         ↓
    Main App (Tabs)
```

## 🎯 Files Created

### Permission Screens

- ✅ `app/permissions/location.tsx` - Step 1/4
- ✅ `app/permissions/background.tsx` - Step 2/4
- ✅ `app/permissions/battery.tsx` - Step 3/4
- ✅ `app/permissions/device.tsx` - Step 4/4

### Utilities

- ✅ `utils/permissions.ts` - Helper functions

### Updated Files

- ✅ `app/auth/login.tsx` - Added onboarding check
- ✅ `app/auth/signup.tsx` - Routes to permissions
- ✅ `app.json` - Location permissions configured
- ✅ `package.json` - Dependencies installed

## 📦 Packages Used

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "expo-location": "^19.0.8"
}
```

## 🔧 How to Test

### 1. Reset Onboarding

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.removeItem("onboarding_completed");
```

### 2. Login Again

The permissions flow will appear automatically.

### 3. Grant Permissions

Follow through all 4 steps, granting each permission.

### 4. Login Again

Should go directly to main app (permissions completed).

## 🎨 UI Features

- ✅ Step indicator (1/4, 2/4, 3/4, 4/4)
- ✅ Progress circles (active, completed, pending)
- ✅ Status badges (Required/Granted/Configured)
- ✅ Info boxes explaining why permissions needed
- ✅ Back and Next buttons
- ✅ Material Icons throughout
- ✅ Design system colors and spacing

## 🔐 Permissions Requested

### Location (Step 1)

- **iOS**: `NSLocationWhenInUseUsageDescription`
- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

### Background Location (Step 2)

- **iOS**: `NSLocationAlwaysAndWhenInUseUsageDescription`
- **Android**: `ACCESS_BACKGROUND_LOCATION`

### Battery Optimization (Step 3)

- **Android**: User guided to settings
- **iOS**: Not needed

### Device Info (Step 4)

- **Both**: Basic device information
- Completes setup and saves state

## 💡 Key Functions

```typescript
// Check if user completed onboarding
const completed = await checkOnboardingCompleted();

// Mark onboarding complete
await setOnboardingCompleted();

// Check location permission
const status = await checkLocationPermission();

// Request location permission
const granted = await requestLocationPermission();

// Get current location
const location = await getCurrentLocation();
```

## 🎯 Next Steps

After permissions are granted:

1. User lands on Home screen
2. App can now access location
3. Ready to implement:
   - ✅ Real-time location tracking
   - ✅ Geofencing for classrooms
   - ✅ Automatic check-in/check-out
   - ✅ Attendance verification

## 📝 Notes

- Permissions can be re-requested if denied
- AsyncStorage tracks onboarding completion
- Background location requires foreground first
- Battery optimization is Android-specific
- All screens follow Atendify design system
