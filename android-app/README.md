# CrowdVision AI Android App

Real-time crowd detection alerts for authorities and security personnel.

## Features

- **Push Notifications**: Receive instant alerts when high crowd density is detected
- **Alert History**: View all past alerts with details
- **Risk Levels**: Color-coded alerts based on crowd density (low, medium, high)
- **Acknowledgement**: Mark alerts as acknowledged to track response
- **Real-time Updates**: Live data synchronized with CrowdVision AI web dashboard

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Android Studio or Xcode
- Expo CLI: `npm install -g expo-cli`
- Firebase project with credentials provided

### Step 1: Install Dependencies

```bash
cd android-app
npm install
```

### Step 2: Configure Firebase

The Firebase configuration is already set up with:
- Project ID: `crowdvision-ai-7e13f`
- App ID: `1:1030038224372:web:aebdf076e33a1447ad4da1`

1. Download `google-services.json` from Firebase Console
2. Place it in `android-app/android/app/`
3. Enable Firebase Cloud Messaging (FCM) in Firebase Console

### Step 3: Run the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Push Notification Integration

### Backend Integration

The Next.js API route (`app/api/detect-crowd/route.ts`) sends notifications via FCM:

```typescript
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY

async function sendAlertToAndroidApp(alert: any) {
  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: '/topics/crowdvision-alerts',
      notification: {
        title: 'High Crowd Density Alert',
        body: `${alert.count} people detected at ${alert.cameraId}`,
        sound: 'alert',
      },
      data: alert,
    }),
  })
}
```

### Environment Variables

Add to your `.env.local`:

```
FCM_SERVER_KEY=your_fcm_server_key_here
```

## Testing Notifications

1. Run the Android app on a physical device or emulator
2. Note the FCM token from console logs
3. Use Firebase Console "Cloud Messaging" to send test notifications
4. Or trigger alerts from the web dashboard when crowd density exceeds threshold

## Building for Production

### Android APK

```bash
expo build:android
```

### Android App Bundle (for Play Store)

```bash
expo build:android -t app-bundle
```

## App Architecture

- **React Native + Expo**: Cross-platform mobile framework
- **Firebase Cloud Messaging**: Push notifications
- **Notifee**: Advanced notification handling
- **Linear Gradient**: Glassmorphism UI effects

## Customization

### Alert Thresholds

Modify in `app/api/detect-crowd/route.ts`:

```typescript
const ALERT_THRESHOLDS = {
  low: 5,
  medium: 10,
  high: 15,
}
```

### Notification Sounds

Replace `alert.mp3` in `android-app/assets/sounds/`

### App Icon & Splash Screen

Replace images in `android-app/assets/`

## Troubleshooting

### Notifications not received

1. Check FCM token is valid
2. Verify Firebase project configuration
3. Ensure app has notification permissions
4. Check FCM server key in backend

### Build errors

1. Clear cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Update Expo CLI: `npm install -g expo-cli@latest`

## Support

For issues or questions, check the documentation or contact support.
