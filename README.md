# Noor: Prayer Times & Quran

## Project info

A native cross-platform mobile app for Muslims — prayer times, Qibla direction, Quran, and spiritual growth tracking.

**Platform**: Native iOS & Android app
**Framework**: Expo Router + React Native

## Getting Started

### Prerequisites

- Node.js — [install with nvm](https://github.com/nvm-sh/nvm)
- npm (included with Node.js)

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd noor

# Install dependencies
npm install

# Start the dev server
npm start

# Start iOS preview (press "i" in terminal)
npm start
```

## Tech Stack

- **React Native** - Cross-platform native mobile framework
- **Expo** - React Native platform & tooling
- **Expo Router** - File-based routing
- **TypeScript** - Type-safe JavaScript
- **React Query** - Server state management
- **Lucide React Native** - Icons
- **RevenueCat** - In-app purchases & subscriptions
- **Adhan** - Prayer time calculations

## Testing

### On your phone

1. **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
2. **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
3. Run `npm start` and scan the QR code

### In your browser

Run `npm run start-web` to test in a web browser.

### iOS Simulator / Android Emulator

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

## Deployment

### Publish to App Store (iOS)

```bash
npm i -g @expo/eas-cli
eas build:configure
eas build --platform ios
eas submit --platform ios
```

### Publish to Google Play (Android)

```bash
eas build --platform android
eas submit --platform android
```

## Troubleshooting

- **App not loading?** Make sure your phone and computer are on the same WiFi network. Try tunnel mode: `npx expo start --tunnel`
- **Build failing?** Clear cache: `npx expo start --clear`. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check [Expo's documentation](https://docs.expo.dev/) for native APIs
- Browse [React Native's documentation](https://reactnative.dev/docs/getting-started) for core components
