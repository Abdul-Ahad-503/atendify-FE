# Atendify

Location-Based Attendance System built with React Native and Expo.

## Project Structure

```
myApp/
├── app/
│   ├── _layout.tsx           # Root layout with navigation setup
│   ├── splash.tsx            # Splash screen with Atendify branding
│   ├── auth/
│   │   ├── login.tsx         # Login screen
│   │   └── signup.tsx        # Signup/registration screen
│   └── (tabs)/
│       ├── _layout.tsx       # Tab navigation layout
│       ├── index.tsx         # Home screen
│       ├── explore.tsx       # Explore screen with features
│       └── profile.tsx       # User profile screen
├── components/
│   ├── haptic-tab.tsx        # Custom tab button with haptic feedback
│   └── ui/                   # UI components
├── constants/
│   └── theme.ts              # Design system (colors, typography, spacing)
└── hooks/                    # Custom React hooks
```

## Design System

The app follows the design guidelines specified in `design.md`:

### Colors

- **Primary**: `#2563EB` (Blue)
- **Secondary**: `#14B8A6` (Teal)
- **Background**: `#F8FAFC` (Light Gray)
- **Surface**: `#FFFFFF` (White)
- **Text Primary**: `#0F172A` (Dark Gray)
- **Text Secondary**: `#475569` (Gray)

### Typography

- **H1**: 32px, SemiBold
- **H2**: 24px, SemiBold
- **H3**: 20px, Medium
- **Body**: 16px, Regular
- **Small**: 14px, Regular

### Spacing (8px Grid)

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

## Routes

- `/splash` - Initial splash screen (3s delay)
- `/auth/login` - Login screen
- `/auth/signup` - Registration screen
- `/(tabs)` - Main app with bottom tabs:
  - `/` (index) - Home screen
  - `/explore` - Features exploration
  - `/profile` - User profile

## Running the App

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Features

- ✅ Splash screen with Atendify branding
- ✅ Clean authentication flow (Login/Signup)
- ✅ Tab-based navigation
- ✅ Design system implementation
- ✅ Material Icons integration
- 🔄 Location-based attendance (Coming soon)
- 🔄 Real-time updates (Coming soon)
- 🔄 Analytics dashboard (Coming soon)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI**: Material Icons
- **TypeScript**: Full type safety
- **Design**: Custom design system based on design.md

## Next Steps

1. Implement authentication logic
2. Add location tracking functionality
3. Create attendance marking feature
4. Build analytics dashboard
5. Add real-time notifications
