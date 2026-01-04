# Saufee Deployment Guide

Complete guide for deploying Saufee to iOS App Store and Google Play Store.

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Create `.env` file from `.env.example`
- [ ] Add Supabase URL and Anon Key
- [ ] Add Anthropic API Key
- [ ] Add RevenueCat iOS and Android keys
- [ ] Verify all keys are valid and working

### 2. Supabase Setup
- [ ] Create Supabase project
- [ ] Run all SQL files in order:
  - `supabase/01_schema.sql`
  - `supabase/02_rls_policies.sql`
  - `supabase/03_triggers.sql`
  - `supabase/04_indexes.sql`
  - `supabase/05_storage.sql`
- [ ] Configure Storage bucket (avatars):
  - Max file size: 5MB
  - Allowed types: image/jpeg, image/png, image/webp
- [ ] Deploy Edge Functions:
  - `supabase/functions/reset-ai-generations`
  - `supabase/functions/revenuecat-webhook`
- [ ] Test database connection from app

### 3. RevenueCat Setup
- [ ] Create RevenueCat account
- [ ] Create iOS project in RevenueCat
- [ ] Create Android project in RevenueCat
- [ ] Configure products:
  - Monthly: `saufee_premium_monthly` ($4.99/month)
  - Annual: `saufee_premium_annual` ($39.99/year)
- [ ] Set up entitlement: `premium`
- [ ] Configure webhook URL (Supabase Edge Function)
- [ ] Test purchase flow in sandbox/test mode

### 4. App Icons & Assets
- [ ] Generate app icons using `SaufeeIcon` component
- [ ] Create all required sizes:
  - iOS: 1024x1024, 180x180, 167x167, 152x152, 120x120, 76x76
  - Android: 512x512, 192x192, 96x96, 72x72, 48x48
- [ ] Place icons in `assets/` folder
- [ ] Create splash screen image
- [ ] Create adaptive icon for Android
- [ ] Verify all assets in app.json

### 5. Legal & Support
- [ ] Create Privacy Policy at https://saufee.com/privacy
- [ ] Create Terms of Service at https://saufee.com/terms
- [ ] Set up support email: support@saufee.com
- [ ] Verify all links open correctly in app

### 6. Testing
- [ ] Test signup flow (creates user + metadata)
- [ ] Test login flow (restores session)
- [ ] Test onboarding (shows only once)
- [ ] Test free tier limit (3 generations → paywall)
- [ ] Test AI generation (creates routine + schedules)
- [ ] Test premium purchase (monthly & annual)
- [ ] Test restore purchases
- [ ] Test all premium features
- [ ] Test notifications (premium)
- [ ] Test template creation, likes, uses
- [ ] Test real-time updates
- [ ] Test analytics dashboard
- [ ] Test settings (save to Supabase)
- [ ] Test logout
- [ ] Test deep links
- [ ] Test offline behavior
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test on different screen sizes

### 7. Performance
- [ ] Run `expo-doctor` and fix all issues
- [ ] Remove all `console.log` statements
- [ ] Fix all TypeScript errors
- [ ] Test animations (should be 60fps)
- [ ] Test app launch time
- [ ] Verify image caching works
- [ ] Test memory usage
- [ ] Profile app performance

### 8. Code Quality
- [ ] All features working correctly
- [ ] No errors in console
- [ ] No TypeScript errors
- [ ] All navigation working
- [ ] All modals close properly
- [ ] Haptic feedback on all interactions
- [ ] Loading states everywhere
- [ ] Error handling comprehensive
- [ ] Empty states implemented

---

## Building with EAS

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Configure EAS Build
```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### Update app.json
Add your EAS project ID:
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

### Build for iOS
```bash
# Development build
eas build --profile development --platform ios

# Production build for App Store
eas build --profile production --platform ios
```

### Build for Android
```bash
# Development build
eas build --profile development --platform android

# Production build for Play Store
eas build --profile production --platform android
```

### Submit to App Stores

#### iOS App Store
```bash
eas submit --platform ios
```

You'll need:
- Apple Developer account ($99/year)
- App Store Connect app created
- App icon (1024x1024)
- Screenshots (all required sizes)
- App description
- Keywords
- Privacy policy URL
- Support URL

#### Google Play Store
```bash
eas submit --platform android
```

You'll need:
- Google Play Console account ($25 one-time)
- Play Console app created
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (minimum 2)
- App description
- Privacy policy URL
- Content rating questionnaire

---

## App Store Metadata

### App Name
Saufee - AI Routine Planner

### Subtitle (iOS)
Transform chaos into clarity with AI

### Short Description (Android)
AI-powered routine planner that turns your brain dump into structured schedules.

### Full Description
Transform your chaotic to-do lists into perfectly organized routines with Saufee, the AI-powered routine planner.

**How it works:**
Simply describe your week in plain English, and our smart AI will create a realistic, personalized schedule tailored to your life.

**Key Features:**
✓ AI Schedule Generation - Turn natural language into structured routines
✓ Smart Optimization - Get AI-powered suggestions to improve your schedule
✓ Templates Marketplace - Browse and use community-created routines
✓ Analytics & Insights - Track completion rates and productivity patterns
✓ Custom Notifications - Never miss an important activity
✓ Export & Share - Share your routines or export your data

**Free Features:**
• 3 AI generations per month
• Basic schedule management
• Community templates
• Manual activity editing

**Premium Features:**
• Unlimited AI generations
• Smart schedule optimization
• Advanced analytics
• Custom notifications
• Template sharing
• Priority support

Perfect for:
• Students managing study schedules
• Professionals balancing work and life
• Fitness enthusiasts planning workouts
• Anyone seeking better time management

Download Saufee today and turn your chaos into clarity!

### Keywords (iOS - 100 chars max)
routine,planner,ai,schedule,productivity,time,management,tasks,calendar,goals

### Primary Category
Productivity

### Secondary Category
Lifestyle

### Age Rating
4+ (no objectionable content)

### Privacy Policy URL
https://saufee.com/privacy

### Support URL
https://saufee.com/support

### Marketing URL
https://saufee.com

---

## Screenshots Guide

### iOS Required Sizes
- 6.7" (iPhone 15 Pro Max): 1290 x 2796
- 6.5" (iPhone 11 Pro Max): 1284 x 2778
- 5.5" (iPhone 8 Plus): 1242 x 2208

### Android Required Sizes
- Phone: 1080 x 1920 or 1080 x 2340
- 7" Tablet: 1200 x 1920
- 10" Tablet: 1600 x 2560

### Suggested Screenshots (5-8 total)
1. **Onboarding/Welcome** - Show first onboarding screen with logo
2. **Brain Dump** - User entering tasks in natural language
3. **AI Generated Schedule** - Beautiful weekly routine view
4. **Templates** - Community templates marketplace
5. **Analytics** (Premium) - Charts and insights
6. **Routine Detail** - Single routine with activities
7. **Paywall** - Premium features showcase
8. **Settings** - Profile and subscription management

### Screenshot Tips
- Use device frames for visual appeal
- Show actual app content (not placeholders)
- Include compelling copy overlays
- Highlight key features
- Use consistent branding (orange accent)
- Show diverse user personas
- Demonstrate value proposition

---

## Release Notes Template

### Version 1.0.0 (Initial Release)

Introducing Saufee - Transform Chaos into Clarity! 🎉

Transform your scattered tasks into organized routines with AI-powered schedule generation.

**What's New:**
• AI Schedule Generation - Describe your week, get a perfect schedule
• Community Templates - Browse hundreds of pre-made routines
• Smart Optimization - AI suggestions to improve your schedule (Premium)
• Analytics Dashboard - Track your productivity patterns (Premium)
• Custom Notifications - Never miss important activities (Premium)
• Beautiful Design - Clean, intuitive interface with smooth animations

**Free Features:**
• 3 AI generations per month
• Unlimited manual schedule editing
• Access to community templates
• Basic routine management

**Premium Subscription:**
• Unlimited AI generations
• Smart schedule optimization
• Advanced analytics & insights
• Custom push notifications
• Share your templates
• Priority support

We'd love to hear your feedback! Contact us at support@saufee.com

---

## Post-Launch Checklist

### Monitoring
- [ ] Set up app analytics (Firebase/Mixpanel)
- [ ] Set up error tracking (Sentry)
- [ ] Monitor crash reports
- [ ] Track key metrics:
  - Daily/Monthly Active Users
  - AI generation usage
  - Premium conversion rate
  - Retention rate (Day 1, Day 7, Day 30)
  - Average session length

### Support
- [ ] Monitor support email
- [ ] Respond to App Store reviews
- [ ] Respond to Play Store reviews
- [ ] Create FAQ document
- [ ] Set up status page

### Marketing
- [ ] Prepare social media accounts
- [ ] Create landing page
- [ ] Prepare launch announcement
- [ ] Plan Product Hunt launch
- [ ] Reach out to reviewers/influencers

### Updates
- [ ] Plan roadmap for next features
- [ ] Prioritize user feedback
- [ ] Schedule regular updates
- [ ] Monitor competitor apps
- [ ] A/B test paywall variations

---

## Troubleshooting

### Build Issues
**Problem:** EAS build fails
- Check `eas.json` configuration
- Verify all dependencies are installed
- Run `expo-doctor` to diagnose issues
- Check build logs on Expo dashboard

**Problem:** App crashes on launch
- Check ErrorBoundary is working
- Review device logs
- Test on multiple devices
- Verify all API keys are correct

### Deployment Issues
**Problem:** App Store rejection
- Review App Store Review Guidelines
- Check privacy policy is accessible
- Verify all features work without login
- Provide demo account if needed

**Problem:** In-app purchases not working
- Verify RevenueCat is configured
- Check product IDs match exactly
- Test in sandbox environment first
- Verify webhook is receiving events

### Performance Issues
**Problem:** App is slow
- Profile with React DevTools
- Check for unnecessary re-renders
- Optimize images and assets
- Use React.memo and useMemo

**Problem:** High memory usage
- Check for memory leaks
- Optimize image caching
- Reduce animation complexity
- Test on older devices

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Supabase Docs:** https://supabase.com/docs
- **RevenueCat Docs:** https://docs.revenuecat.com/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Guidelines:** https://play.google.com/about/developer-content-policy/

For Saufee-specific help, contact: support@saufee.com
