# Saufee - Build & Deploy Commands

Quick reference for all build and deployment commands.

## Development

### Start Development Server
```bash
cd Saufee
npx expo start
```

### Run on iOS Simulator
```bash
npx expo start --ios
```

### Run on Android Emulator
```bash
npx expo start --android
```

### Run on Web
```bash
npx expo start --web
```

### Clear Cache
```bash
npx expo start --clear
```

---

## Pre-Build Checks

### Check for Issues
```bash
npx expo-doctor
```

### TypeScript Check
```bash
npx tsc --noEmit
```

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Update Expo SDK
```bash
npx expo install expo@latest
```

---

## EAS Build Setup

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Initialize EAS
```bash
eas build:configure
```

This creates `eas.json` with default build profiles.

### Link Project to EAS
```bash
eas init
```

Get your project ID and add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

---

## Building

### Development Builds

#### iOS Development Build
```bash
eas build --profile development --platform ios
```

#### Android Development Build
```bash
eas build --profile development --platform android
```

### Production Builds

#### iOS Production Build
```bash
eas build --profile production --platform ios
```

#### Android Production Build (APK)
```bash
eas build --profile production --platform android
```

#### Android Production Build (AAB for Play Store)
```bash
eas build --profile production --platform android --app-bundle
```

### Build Both Platforms
```bash
eas build --profile production --platform all
```

### Check Build Status
```bash
eas build:list
```

### View Build Details
```bash
eas build:view [build-id]
```

---

## Submitting to Stores

### iOS App Store

#### Configure Credentials
```bash
eas credentials
```

#### Submit to App Store
```bash
eas submit --platform ios
```

You'll need:
- Apple ID
- App-specific password
- App Store Connect app ID

#### Check Submission Status
```bash
eas submit:list
```

### Google Play Store

#### Submit to Play Store
```bash
eas submit --platform android
```

You'll need:
- Google Service Account JSON key
- Play Console app ID
- Track (internal/alpha/beta/production)

#### Upload to Internal Testing
```bash
eas submit --platform android --track internal
```

#### Upload to Beta
```bash
eas submit --platform android --track beta
```

#### Upload to Production
```bash
eas submit --platform android --track production
```

---

## App Updates

### Publish Update (OTA)
```bash
eas update --branch production --message "Bug fixes and improvements"
```

### Create Update Branch
```bash
eas update --branch staging --message "Staging update"
```

### View Updates
```bash
eas update:list
```

### Configure Auto-Updates
In `app.json`:
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

---

## Environment Management

### Set Environment Variables for Build
```bash
eas build --profile production --platform ios --non-interactive
```

With secrets:
```bash
eas secret:create EXPO_PUBLIC_API_KEY
```

List secrets:
```bash
eas secret:list
```

---

## Testing Builds

### Install Development Build on Device

#### iOS (via TestFlight)
```bash
eas build --profile preview --platform ios
```
Then use the TestFlight link from the build output.

#### Android (Direct Install)
```bash
eas build --profile preview --platform android
```
Download APK from build output and install on device.

### Internal Distribution

#### iOS Ad Hoc
```bash
eas build --profile preview --platform ios
```
Register devices in Apple Developer Console.

#### Android Internal Testing
Upload to Google Play Console Internal Testing track.

---

## Debugging

### View Build Logs
```bash
eas build:view [build-id]
```

### Download Build Artifact
Artifacts are available in the Expo dashboard or via:
```bash
eas build:download [build-id]
```

### Local Build (for debugging)
```bash
eas build --profile development --platform ios --local
```

---

## Version Management

### Increment Version

#### iOS (bump build number)
In `app.json`:
```json
{
  "ios": {
    "buildNumber": "1.0.1"
  }
}
```

#### Android (bump version code)
In `app.json`:
```json
{
  "android": {
    "versionCode": 2
  }
}
```

#### App Version
In `app.json`:
```json
{
  "version": "1.0.1"
}
```

---

## Certificates & Provisioning

### Manage iOS Credentials
```bash
eas credentials -p ios
```

Options:
- Set up Push Notifications
- Set up Distribution Certificate
- Set up Provisioning Profile

### Manage Android Credentials
```bash
eas credentials -p android
```

Options:
- Set up Keystore
- Download Keystore

### Regenerate Credentials
```bash
eas credentials --clear-provisioning-profile
```

---

## Common Issues & Solutions

### Build Failed: Missing Credentials
```bash
eas credentials -p ios
# or
eas credentials -p android
```

### Build Failed: TypeScript Errors
```bash
npx tsc --noEmit
# Fix all errors, then rebuild
```

### Build Failed: Dependency Issues
```bash
npm install --legacy-peer-deps
rm -rf node_modules
npm install --legacy-peer-deps
```

### Update Failed: Runtime Version Mismatch
Update `runtimeVersion` in `app.json`:
```json
{
  "runtimeVersion": "1.0.0"
}
```

### Build Stuck: Cancel and Retry
```bash
# Find build ID
eas build:list

# Cancel build
eas build:cancel [build-id]

# Rebuild
eas build --profile production --platform [ios|android]
```

---

## Production Deployment Workflow

### 1. Final Testing
```bash
# Run doctor
npx expo-doctor

# Check TypeScript
npx tsc --noEmit

# Test on devices
npx expo start
```

### 2. Version Bump
Update in `app.json`:
- `version`: "1.0.1"
- `ios.buildNumber`: "1.0.1"
- `android.versionCode`: 2

### 3. Build
```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

### 4. Submit
```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

### 5. Monitor
- Check App Store Connect for review status
- Check Play Console for review status
- Monitor crash reports
- Respond to reviews

### 6. Post-Launch Update (OTA)
```bash
# Small fixes that don't require native changes
eas update --branch production --message "Bug fixes"
```

---

## Useful Links

- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Dashboard**: https://expo.dev/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Google Play Console**: https://play.google.com/console/
- **RevenueCat Dashboard**: https://app.revenuecat.com/
- **Supabase Dashboard**: https://app.supabase.com/

---

## Quick Deploy Checklist

Before running build commands:
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Version bumped in app.json
- [ ] Environment variables set
- [ ] Credentials configured
- [ ] Assets updated (if needed)
- [ ] Changelog/release notes prepared

---

## Support

For issues with builds:
- Check Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/
- GitHub Issues: https://github.com/expo/expo/issues

For Saufee-specific help:
- Email: support@saufee.com
- Documentation: DEPLOYMENT.md
