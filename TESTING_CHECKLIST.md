# Saufee Testing Checklist

Comprehensive testing checklist for Saufee app before deployment.

## Authentication & Onboarding

### Sign Up Flow
- [ ] User can create account with email and password
- [ ] Display name is required
- [ ] Password must match confirm password
- [ ] Email validation works
- [ ] `users_metadata` row is auto-created via database trigger
- [ ] User is redirected to onboarding after signup
- [ ] Error messages are clear and helpful
- [ ] Haptic feedback on button press
- [ ] Loading state shows during signup

### Login Flow
- [ ] User can log in with correct credentials
- [ ] Error shown for incorrect password
- [ ] Error shown for non-existent email
- [ ] Session persists after app restart
- [ ] User is redirected to home after login
- [ ] Returning users skip onboarding
- [ ] Haptic feedback on button press
- [ ] Loading state shows during login

### Onboarding Flow
- [ ] Onboarding shows only once for new users
- [ ] All 3 screens are swipeable
- [ ] Skip button works on screens 1-2
- [ ] Skip button jumps to screen 3
- [ ] Next button advances to next screen
- [ ] Page indicators update correctly
- [ ] All animations play smoothly
- [ ] "Start Free Trial" navigates to tabs then paywall
- [ ] "Continue with Free" navigates to tabs only
- [ ] Onboarding completion saved to AsyncStorage
- [ ] Legal links open in browser
- [ ] Haptic feedback on all interactions

## Brain Dump & AI Generation

### Free User (0/3 Generations)
- [ ] Usage indicator shows "0 of 3 free generations used"
- [ ] AI generation works
- [ ] Routine and schedules are created in database
- [ ] User is navigated to routine detail screen
- [ ] Generation count increments to 1/3
- [ ] Success animation plays
- [ ] Haptic feedback on generation

### Free User (3/3 Generations - Limit Reached)
- [ ] Usage indicator shows "3 of 3 free generations used"
- [ ] Generate button is disabled
- [ ] Error message explains limit reached
- [ ] Paywall is shown automatically
- [ ] User can still view existing routines
- [ ] User can manually edit routines

### Premium User
- [ ] Usage indicator shows "Premium - Unlimited"
- [ ] AI generation works unlimited times
- [ ] No limit enforcement
- [ ] Premium badge is visible
- [ ] Optimize button is available

### Edge Cases
- [ ] Empty input shows error
- [ ] Very long input (>1000 chars) works
- [ ] Special characters in input work
- [ ] API error shows user-friendly message
- [ ] Network error shows retry option
- [ ] Rate limit error shows appropriate message

## Routine Management

### Routine Detail Screen
- [ ] All activities display correctly grouped by day
- [ ] Time is shown in 12-hour format
- [ ] Duration is displayed
- [ ] Pull-to-refresh works
- [ ] Routine title can be edited
- [ ] Activities are sorted by time
- [ ] Empty days show empty state
- [ ] Back button navigates to home

### Edit Activity
- [ ] Tap activity opens edit modal
- [ ] Activity name can be changed
- [ ] Time can be changed (HH:MM format)
- [ ] Duration can be changed (minutes)
- [ ] Save button updates activity
- [ ] Cancel button discards changes
- [ ] Changes save to database
- [ ] Haptic feedback on save

### Delete Activity
- [ ] Swipe left reveals delete button
- [ ] Delete button is red with trash icon
- [ ] Confirmation dialog appears
- [ ] Activity is deleted from database
- [ ] UI updates immediately
- [ ] Haptic warning feedback on delete
- [ ] Cancel doesn't delete activity

### Add Activity (FAB)
- [ ] FAB is visible in bottom-right
- [ ] Tap FAB opens add modal
- [ ] All days are selectable
- [ ] Activity name is required
- [ ] Time is required (HH:MM format)
- [ ] Duration is required (minutes)
- [ ] Add button creates activity
- [ ] Activity appears in correct day
- [ ] Activity saves to database
- [ ] Haptic feedback on add

### Optimize Schedule (Premium)
- [ ] Free users see lock icon and "Premium" label
- [ ] Free users redirected to paywall on tap
- [ ] Premium users see gradient button
- [ ] Optimization calls AI service
- [ ] 3-5 suggestions are shown
- [ ] Impact levels displayed (high/medium/low)
- [ ] Impact badges are color-coded
- [ ] Suggestions are actionable
- [ ] Modal can be dismissed
- [ ] Haptic feedback on optimize

## Templates

### Official Templates
- [ ] 5 official templates are shown
- [ ] Template cards display correctly
- [ ] Tap "Use Template" pre-fills brain dump
- [ ] User is navigated to home screen
- [ ] Input field has template text
- [ ] User can edit template text before generating

### Community Templates
- [ ] Real-time updates work (new templates appear)
- [ ] Search bar filters by title, category, creator
- [ ] Sort by "Most Popular" works (likes_count DESC)
- [ ] Sort by "Recently Added" works (created_at DESC)
- [ ] Category filters work (All, Work, Fitness, etc.)
- [ ] Category badges are color-coded correctly
- [ ] Pull-to-refresh reloads templates
- [ ] Infinite scroll pagination works (20 per page)
- [ ] Empty state shows when no results

### Template Actions
- [ ] Like button toggles (heart fills/unfills)
- [ ] Like count updates optimistically
- [ ] Like saves to database
- [ ] Unlike works correctly
- [ ] "Use Template" copies to user's routines
- [ ] Use count increments
- [ ] Template creator is shown (@username)
- [ ] Haptic feedback on like

### Share Template (Premium)
- [ ] Free users see paywall when tapping Share
- [ ] Premium users see share modal
- [ ] Category selector works (5 categories)
- [ ] Description is optional
- [ ] Publish button creates public template
- [ ] Template appears in community feed
- [ ] Success message shown
- [ ] Duplicate prevention works
- [ ] Haptic feedback on publish

## Paywall & Subscriptions

### Paywall UI
- [ ] Close button (X) navigates back
- [ ] 6 premium features are listed
- [ ] Features have icons
- [ ] Staggered animations play
- [ ] Monthly price shown ($4.99/month)
- [ ] Annual price shown ($39.99/year)
- [ ] Annual has "Save 33%" badge
- [ ] Annual card has orange border
- [ ] Legal links open in browser

### Purchase Flow - Monthly
- [ ] Tap monthly button starts purchase
- [ ] Loading state shows
- [ ] iOS payment sheet appears
- [ ] Successful purchase completes
- [ ] Success animation plays
- [ ] User tier updates to "premium"
- [ ] Paywall closes automatically
- [ ] Premium features unlock immediately
- [ ] Haptic success feedback

### Purchase Flow - Annual
- [ ] Tap annual button starts purchase
- [ ] Loading state shows
- [ ] iOS payment sheet appears
- [ ] Successful purchase completes
- [ ] Success animation plays
- [ ] User tier updates to "premium"
- [ ] Paywall closes automatically
- [ ] Premium features unlock immediately
- [ ] Savings are highlighted

### Purchase Errors
- [ ] User cancellation is silent (no error)
- [ ] Payment failed shows error message
- [ ] Network error shows retry option
- [ ] Unknown error shows generic message
- [ ] Error haptic feedback plays

### Restore Purchases
- [ ] "Restore Purchases" button visible
- [ ] Tap starts restore process
- [ ] Loading state shows
- [ ] Successful restore updates tier
- [ ] No purchases shows info message
- [ ] Haptic feedback on restore

## Analytics Dashboard (Premium)

### Access Control
- [ ] Free users see blurred preview
- [ ] Free users see premium guard overlay
- [ ] Lock icon is displayed
- [ ] "Upgrade to Premium" button shows paywall
- [ ] "Not now" button navigates back
- [ ] Premium users see full dashboard
- [ ] Haptic feedback on buttons

### Metrics Cards
- [ ] Completion Rate displays correctly (%)
- [ ] Current Streak displays (days)
- [ ] Total Activities count is accurate
- [ ] Most Productive Time shows (Morning/Afternoon/Evening)
- [ ] All icons are colored correctly
- [ ] Cards have subtle shadows

### Charts
- [ ] Weekly Activity bar chart displays
- [ ] All 7 days shown (Mon-Sun)
- [ ] Activity counts are accurate
- [ ] Category pie chart displays
- [ ] Categories are color-coded
- [ ] Time of Day horizontal bar chart displays
- [ ] Charts are responsive
- [ ] Charts load without lag

### Data & Empty States
- [ ] Dashboard pulls from routine_analytics table
- [ ] Calculations are real-time
- [ ] Empty state shows when no data
- [ ] Share button generates summary
- [ ] Pull-to-refresh reloads data

## Notifications (Premium)

### Access Control
- [ ] Free users see lock icons
- [ ] Free users redirected to paywall on toggle tap
- [ ] Premium users can toggle notifications
- [ ] Settings save to users_metadata

### Activity Reminders
- [ ] Bell icon shows on each activity (routine detail)
- [ ] Bell is orange if notification enabled
- [ ] Bell is gray if notification disabled
- [ ] Tap bell opens NotificationSettings modal
- [ ] Free users see paywall
- [ ] Premium users can configure
- [ ] Advance minutes selector works (5/10/15/30/60)
- [ ] "Apply to all" toggle works
- [ ] Notifications schedule correctly
- [ ] Notification ID saves to schedules table
- [ ] Weekly repeating works

### Daily Digest
- [ ] Morning Summary toggle works
- [ ] Default time is 8:00 AM
- [ ] Daily repeating notification schedules
- [ ] Notification fires at correct time
- [ ] Title and body are correct

### Completion Reminder
- [ ] End of Day toggle works
- [ ] Default time is 9:00 PM
- [ ] Daily repeating notification schedules
- [ ] Notification fires at correct time
- [ ] Title and body are correct

### Notification Permissions
- [ ] iOS asks for permission on first toggle
- [ ] Android asks for permission
- [ ] Permission denial is handled gracefully
- [ ] Notifications work when app is closed
- [ ] Tap notification opens app
- [ ] Tap notification navigates correctly

### Edge Cases
- [ ] User downgrades to free: All notifications cancelled
- [ ] Activity deleted: Notification cancelled
- [ ] Routine deleted: All activity notifications cancelled
- [ ] Permission denied: Settings save but notifications don't fire

## Settings Screen

### Profile Section
- [ ] Avatar displays (or initials if none)
- [ ] Display name shows correctly
- [ ] Email shows correctly (non-editable)
- [ ] "Edit Profile" opens modal
- [ ] Avatar can be changed
- [ ] Display name can be edited
- [ ] Changes save to users_metadata
- [ ] Success toast appears
- [ ] Haptic feedback on save

### Subscription Section - Free User
- [ ] "Current Plan: Free" heading shows
- [ ] Features list correct (3 generations, basic schedules)
- [ ] Usage progress bar displays
- [ ] Progress bar fill is accurate
- [ ] "X/3 generations used" text correct
- [ ] "Upgrade to Premium" button opens paywall
- [ ] "Restore Purchases" button works
- [ ] Haptic feedback on buttons

### Subscription Section - Premium User
- [ ] "Current Plan: Premium ⭐" heading shows
- [ ] Crown icon displays
- [ ] Subscription type shown (Monthly/Annual)
- [ ] "Manage Subscription" button works
- [ ] Next billing date shows (if available)

### Notifications Section
- [ ] Push Notifications toggle works
- [ ] Toggle is orange when enabled
- [ ] "Configure Reminders" row shows
- [ ] Free users see lock icon
- [ ] Free users redirected to paywall
- [ ] Premium users see NotificationSettings modal
- [ ] Settings save to database

### Data & Privacy Section
- [ ] "Export My Data" shows action sheet
- [ ] Export options listed (PDF, CSV, JSON)
- [ ] "Coming soon" toast appears
- [ ] "Delete All Routines" works
- [ ] Confirmation dialog appears
- [ ] Routines deleted from database
- [ ] Success toast appears
- [ ] "Delete Account" requires double confirmation
- [ ] First confirmation appears
- [ ] Second confirmation appears
- [ ] All user data deleted
- [ ] Supabase auth account deleted
- [ ] User logged out and navigated to login

### App Info Section
- [ ] "Privacy Policy" opens in browser
- [ ] "Terms of Service" opens in browser
- [ ] "Contact Support" opens email client
- [ ] Email pre-filled (to, subject)
- [ ] "Rate Saufee" opens App/Play Store
- [ ] "App Version" shows "1.0.0"
- [ ] Version is non-interactive

### Account Actions
- [ ] "Logout" button shows confirmation
- [ ] Confirm logs out user
- [ ] Session cleared
- [ ] User navigated to login
- [ ] Cancel keeps user logged in

## UI/UX Polish

### Animations
- [ ] All screens fade in smoothly
- [ ] Buttons scale on press (0.98)
- [ ] Modals slide up from bottom
- [ ] Loading spinners are smooth
- [ ] Skeleton loaders shimmer
- [ ] Success animations play correctly
- [ ] All animations are 60fps

### Haptic Feedback
- [ ] All buttons give light haptic
- [ ] Toggles give medium haptic
- [ ] Success actions give success haptic
- [ ] Errors give error haptic
- [ ] Deletions give warning haptic
- [ ] Swipe gestures feel responsive

### Loading States
- [ ] Skeletons show while loading
- [ ] Spinners show for async operations
- [ ] Loading states don't flicker
- [ ] Pull-to-refresh shows indicator
- [ ] Button loading states work

### Empty States
- [ ] Empty routines shows icon and message
- [ ] Empty templates shows icon and message
- [ ] Empty analytics shows icon and message
- [ ] Empty search results shows message
- [ ] All empty states are friendly

### Error Handling
- [ ] Network errors show retry option
- [ ] API errors show user-friendly messages
- [ ] Form validation is clear
- [ ] Error messages are helpful
- [ ] ErrorBoundary catches React errors

## Platform-Specific

### iOS
- [ ] App runs on iPhone SE (small screen)
- [ ] App runs on iPhone 15 Pro Max (large screen)
- [ ] App runs on iPad (if supported)
- [ ] Safe area insets respected
- [ ] Status bar style is correct
- [ ] Keyboard doesn't hide inputs
- [ ] Keyboard dismisses on scroll
- [ ] Swipe back gesture works
- [ ] Haptics work correctly
- [ ] In-app purchases work
- [ ] Camera permission prompt shows
- [ ] Photo library permission prompt shows
- [ ] Notification permission prompt shows

### Android
- [ ] App runs on small phone (5")
- [ ] App runs on large phone (6.7")
- [ ] App runs on tablet (if supported)
- [ ] Safe area insets respected
- [ ] Status bar style is correct
- [ ] Keyboard doesn't hide inputs
- [ ] Keyboard dismisses on scroll
- [ ] Back button works correctly
- [ ] Ripple effects work
- [ ] In-app purchases work
- [ ] Camera permission prompt shows
- [ ] Storage permission prompt shows
- [ ] Notification permission prompt shows
- [ ] Adaptive icon displays correctly

## Performance

### Launch Time
- [ ] App launches in <3 seconds
- [ ] Splash screen displays correctly
- [ ] Fonts load without flicker
- [ ] No white flash on launch

### Navigation
- [ ] Screen transitions are smooth
- [ ] No lag when switching tabs
- [ ] Modals animate smoothly
- [ ] Deep links work correctly

### Memory
- [ ] No memory leaks
- [ ] Image caching works
- [ ] App doesn't crash on low memory
- [ ] Background tasks don't drain battery

### Network
- [ ] App works on slow 3G
- [ ] App works on WiFi
- [ ] Offline mode shows errors gracefully
- [ ] Image loading is optimized
- [ ] API calls are debounced

## Security & Privacy

### Authentication
- [ ] Passwords are hashed (Supabase handles this)
- [ ] Session tokens are secure
- [ ] No sensitive data in logs
- [ ] User can delete their account

### Data Privacy
- [ ] RLS policies enforce data access
- [ ] Users can only see their own data
- [ ] Public templates are readonly
- [ ] API keys are not exposed in app
- [ ] .env file is gitignored

### Payments
- [ ] Payment handled by Apple/Google (secure)
- [ ] No credit card data stored in app
- [ ] Subscription status syncs with RevenueCat
- [ ] Webhook is authenticated

---

## Testing Summary

Total Tests: ~250+

**Before submitting to stores:**
- [ ] All critical paths tested
- [ ] No crashes or critical bugs
- [ ] Performance is acceptable
- [ ] All features working as expected
- [ ] UI is polished and professional
- [ ] Error handling is comprehensive
- [ ] Privacy & security verified

**Recommended:**
- Test on minimum 3 real devices (2 iOS, 1 Android or vice versa)
- Test with real users (beta testers)
- Use TestFlight (iOS) and Internal Testing (Android)
- Fix all reported issues before public release
- Monitor crash reports during beta
- A/B test paywall if possible

Good luck with your launch! 🚀
