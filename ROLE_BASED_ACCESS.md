# Role-Based Access System

## Overview

GeoAttend now supports two user roles: **Student** and **Teacher**, with different screens and features for each role.

## Features Implemented

### 1. Login Screen Role Toggle

- **File**: `app/auth/login.tsx`
- Users can select their role (Student/Teacher) before logging in
- Role is saved to AsyncStorage as `user_role`
- Visual toggle buttons with icons:
  - 🎓 Student
  - 👤 Teacher

### 2. Registration Screen Role-Based Fields

- **File**: `app/auth/signup.tsx`
- Different fields based on selected role:
  - **Student**: Student ID, Course, Semester
  - **Teacher**: Employee ID
  - **Common**: Name, Email, Department, Password

### 3. Role-Specific Home Screen

- **File**: `app/(tabs)/index.tsx`
- Shows different content based on user role:
  - **Student Dashboard**: "Track your attendance and view your records"
  - **Teacher Dashboard**: "Manage classes and track student attendance"
- Role badge displayed in header

### 4. Profile Screen with Role Display

- **File**: `app/(tabs)/profile.tsx`
- Shows user's role badge
- Different avatar icon based on role
- Logout clears role data

### 5. Utility Functions

- **File**: `utils/userRole.ts`
- Helper functions:
  - `getUserRole()` - Get current user's role
  - `setUserRole(role)` - Save user role
  - `clearUserRole()` - Remove role (logout)
  - `isStudent()` - Check if user is student
  - `isTeacher()` - Check if user is teacher

## Usage Examples

### Check User Role in Component

```typescript
import { getUserRole, UserRole } from '@/utils/userRole';
import { useState, useEffect } from 'react';

function MyComponent() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
    };
    loadRole();
  }, []);

  return (
    <View>
      {userRole === 'student' ? (
        <StudentView />
      ) : (
        <TeacherView />
      )}
    </View>
  );
}
```

### Conditional Rendering

```typescript
import { isStudent, isTeacher } from "@/utils/userRole";

// Check if student
const studentMode = await isStudent();
if (studentMode) {
  // Show student-specific features
}

// Check if teacher
const teacherMode = await isTeacher();
if (teacherMode) {
  // Show teacher-specific features
}
```

## Creating Role-Specific Screens

### Option 1: Conditional Rendering

```typescript
export default function HomeScreen() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  if (role === 'student') {
    return <StudentHomeScreen />;
  }

  if (role === 'teacher') {
    return <TeacherHomeScreen />;
  }

  return <LoadingScreen />;
}
```

### Option 2: Separate Screen Files

Create separate files for each role:

- `app/(tabs)/student-home.tsx`
- `app/(tabs)/teacher-home.tsx`

Then route based on role:

```typescript
const role = await getUserRole();
if (role === "student") {
  router.push("/(tabs)/student-home");
} else {
  router.push("/(tabs)/teacher-home");
}
```

## Data Storage

### AsyncStorage Keys

- `user_role` - Stores 'student' or 'teacher'
- `onboarding_completed` - Tracks if user completed setup

### Logout Process

```typescript
import { clearUserRole } from "@/utils/userRole";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleLogout = async () => {
  await clearUserRole();
  await AsyncStorage.removeItem("onboarding_completed");
  router.replace("/auth/login");
};
```

## Next Steps for Separate Screens

### 1. Student-Specific Features

- View personal attendance records
- Mark attendance when in classroom
- View schedule and upcoming classes
- Attendance statistics and graphs

### 2. Teacher-Specific Features

- Create and manage classes
- View all students' attendance
- Mark attendance manually
- Generate attendance reports
- Send notifications to students

### 3. Implementation Approach

Create new files:

```
app/(tabs)/
├── student/
│   ├── _layout.tsx
│   ├── index.tsx (student home)
│   ├── attendance.tsx
│   └── schedule.tsx
├── teacher/
│   ├── _layout.tsx
│   ├── index.tsx (teacher home)
│   ├── classes.tsx
│   └── reports.tsx
```

Then update `app/(tabs)/_layout.tsx` to route based on role:

```typescript
const role = await getUserRole();
const tabsToShow =
  role === "student"
    ? ["student-home", "attendance", "schedule", "profile"]
    : ["teacher-home", "classes", "reports", "profile"];
```

## Testing

### Test Different Roles

1. Login as Student
   - Select "Student" toggle
   - Enter credentials
   - See Student Dashboard

2. Login as Teacher
   - Select "Teacher" toggle
   - Enter credentials
   - See Teacher Dashboard

3. Switch Roles
   - Logout from Profile
   - Login with different role
   - Different content displayed

### Reset Role (for testing)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.removeItem("user_role");
```

## UI Elements

### Role Badge Component

Displays current user role:

```typescript
<View style={styles.roleBadge}>
  <MaterialIcons
    name={role === 'student' ? 'school' : 'person'}
    size={16}
    color={Colors.primary}
  />
  <Text style={styles.roleBadgeText}>
    {role === 'student' ? 'Student' : 'Teacher'}
  </Text>
</View>
```

### Role Toggle Component

For login/signup:

```typescript
<View style={styles.roleContainer}>
  <TouchableOpacity
    style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
    onPress={() => setRole('student')}
  >
    <MaterialIcons name="school" size={24} />
    <Text>Student</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
    onPress={() => setRole('teacher')}
  >
    <MaterialIcons name="person" size={24} />
    <Text>Teacher</Text>
  </TouchableOpacity>
</View>
```

## Benefits

✅ Clear separation between student and teacher experiences
✅ Easy to maintain and extend role-specific features
✅ Better user experience with relevant content
✅ Scalable architecture for future roles
✅ Simple role checking utilities
✅ Persistent role storage across app launches
