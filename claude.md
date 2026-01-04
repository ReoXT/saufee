# Saufee - AI-Powered Routine Planner

## Project Overview
Saufee is an AI-powered routine planner mobile app where users describe their week in plain English and AI generates structured schedules.

## Tech Stack
- **Framework**: Expo SDK 54 (React Native)
- **Language**: TypeScript
- **Navigation**: expo-router v6.0.21 (file-based routing)
- **React**: v19.1.0
- **React Native**: v0.81.5
- **AI**: Google Gemini 3.5 Flash (@google/generative-ai@0.21.0)

## Project Structure
```
Saufee/
├── app/                      # File-based routing screens
│   ├── (auth)/              # Authentication screens (grouped route)
│   │   ├── _layout.tsx     # Auth stack navigator
│   │   ├── login.tsx       # Login screen (with SaufeeLogo)
│   │   └── signup.tsx      # Sign up screen (with SaufeeLogo)
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── _layout.tsx     # Tab navigator (4 tabs)
│   │   ├── index.tsx       # Brain dump screen (Home tab)
│   │   ├── templates.tsx   # Templates marketplace (Templates tab)
│   │   ├── analytics.tsx   # Analytics dashboard (Analytics tab, premium-only)
│   │   └── settings.tsx    # Settings and profile (Settings tab)
│   ├── routine/             # Routine screens
│   │   └── [id].tsx        # Routine detail screen with share feature
│   ├── _layout.tsx          # Root layout with splash screen & auth
│   ├── onboarding.tsx       # 3-screen onboarding flow for new users
│   └── paywall.tsx          # Conversion-optimized paywall
├── components/              # Reusable UI components
│   ├── SaufeeLogo.tsx       # Bold text logo component
│   ├── SaufeeIcon.tsx       # 3D raised platform app icon
│   ├── AnimatedGradientButton.tsx  # Animated gradient button
│   ├── ActivityBubble.tsx   # Swipeable activity card with edit/delete
│   ├── TemplateCard.tsx     # Community template card with like/use
│   ├── withPremiumGuard.tsx # HOC for premium-only features
│   ├── ErrorBoundary.tsx    # Error boundary component for crash handling
│   ├── SuccessAnimation.tsx # Success animation with confetti/sparkles
│   ├── EmptyState.tsx       # Reusable empty state component
│   ├── SkeletonScheduleItem.tsx # Skeleton loader for schedule items
│   └── SkeletonTemplateCard.tsx # Skeleton loader for template cards
├── lib/
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Authentication context & hooks
│   │   └── SubscriptionContext.tsx  # Subscription context & purchase functions
│   ├── utils/
│   │   ├── premium-helpers.ts  # Subscription helper functions
│   │   └── onboarding-helpers.ts  # Onboarding state management
│   ├── supabase.ts          # Supabase client configuration
│   ├── payment-service.ts   # RevenueCat SDK wrapper
│   └── ai-service.ts        # Google Gemini API integration
├── services/                # Background services (notifications, etc.)
├── scripts/                 # Development scripts
│   └── generate-icons.tsx   # App icon generation helper
├── types/                   # TypeScript type definitions
│   ├── database.types.ts    # Database type definitions
│   └── ai.types.ts          # AI service type definitions
├── constants/
│   ├── theme.ts            # Design tokens
│   └── config.ts           # App configuration
├── assets/
│   ├── fonts/              # Inter font files (Regular, Medium, Bold)
│   └── illustrations/      # Empty state illustrations
├── supabase/                # Database SQL files
│   ├── functions/          # Edge functions
│   │   ├── reset-ai-generations/index.ts  # Monthly AI reset
│   │   └── revenuecat-webhook/index.ts    # Payment webhook
│   ├── 01_schema.sql       # Database schema
│   ├── 02_rls_policies.sql # Row-level security
│   ├── 03_triggers.sql     # Database triggers
│   └── 04_indexes.sql      # Performance indexes
├── shim.js                  # Node.js polyfills for React Native
├── babel.config.js          # Configured for Expo SDK 54
└── metro.config.js          # Metro bundler with Node.js polyfills
```

## Design System (constants/theme.ts)
### Colors
- `PRIMARY_ORANGE`: '#FF6B35'
- `WHITE`: '#FFFFFF'
- `BACKGROUND`: '#F8F9FA'
- `TEXT_PRIMARY`: '#1A1A1A'
- `TEXT_SECONDARY`: '#6B7280'
- `ERROR_RED`: '#EF4444'
- `SUCCESS_GREEN`: '#10B981'

### Styling
- `SHADOW`: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, shadowColor: '#000' }
- `BORDER_RADIUS`: 16
- `SPACING_LARGE`: 20
- `SPACING_MEDIUM`: 12

### Typography
- Font Family: Inter (Regular, Medium, Bold)
- Located in: assets/fonts/

## App Configuration (constants/config.ts)
- `FREE_TIER_LIMIT`: 3 (max AI generations per month for free users)
- `APP_NAME`: 'Saufee'

## Dependencies

### Navigation & Routing
- expo-router@6.0.21 (file-based routing)
- expo-linking@8.0.11 (deep linking)
- react-native-safe-area-context@5.6.0
- react-native-screens@4.16.0

### Animation & UI
- react-native-reanimated@4.1.1 (smooth animations)
- react-native-worklets@0.5.1 (worklet support for reanimated)
- react-native-gesture-handler@~2.28.0 (swipe gestures, touch handling)
- expo-linear-gradient@15.0.8 (gradient backgrounds)
- expo-haptics@15.0.8 (haptic feedback)
- react-native-svg@15.12.1 (SVG support)
- react-native-chart-kit@6.12.0 (charts for analytics)
- expo-blur@15.0.8 (blur effects for premium guard)

### Data & Storage
- @supabase/supabase-js@2.45.4 (backend & database)
- @react-native-async-storage/async-storage@2.2.0 (local storage)

### AI Integration
- @google/generative-ai@0.21.0 (Gemini API)

### Notifications & Permissions
- expo-notifications@0.32.15 (push notifications)

### Media & Files
- expo-image-picker@17.0.10 (image selection)

### Fonts & Icons
- expo-font@14.0.10 (custom font loading)
- lucide-react-native@0.446.0 (icon library)

### Charts & Visualization
- react-native-chart-kit@6.12.0 (data visualization)

### Payments
- react-native-purchases@9.6.12 (in-app purchases, RevenueCat)

### Utilities
- @react-native-masked-view/masked-view@0.3.2 (UI masking for gradients)
- react-native-url-polyfill@3.0.0 (URL polyfill for Supabase)
- expo-splash-screen@31.0.13 (splash screen management)

### Node.js Polyfills (for Supabase Realtime)
- events@3.3.0
- readable-stream@4.7.0
- buffer@6.0.3
- process@0.11.10
- crypto-browserify@3.12.1
- https-browserify@1.0.0
- http-browserify@1.7.0
- net@1.0.2
- tls-browserify@0.2.2
- url@0.11.4
- util@0.12.5
- browserify-zlib@0.2.0
- stream-browserify@3.0.0

### Dev Dependencies
- @types/react@19.1.0
- babel-preset-expo@54.0.9
- typescript@5.9.2

## Running the App
```bash
cd Saufee
npx expo start
```

## Database Schema

### Supabase Setup
- Database client: lib/supabase.ts
- Type definitions: types/database.types.ts
- SQL files in supabase/ directory (run in order)

### Tables

**users_metadata**
- Extended user profile data
- Subscription tier (free/premium) and status
- AI generation tracking (used count + reset date)
- Notification settings (JSONB)

**routines**
- User-created routines and templates
- Supports public templates (is_public, is_template flags)
- Category tagging
- Engagement metrics (likes_count, uses_count)

**schedules**
- Individual activities within routines
- Day of week + time slot + activity + duration
- Notification ID for scheduled reminders

**routine_analytics**
- Daily completion tracking
- Completion rate + activity counts
- Historical analytics by date

**public_templates**
- Metadata for published templates
- Creator info and display name
- Featured/verified flags for curation

**template_likes**
- User likes for public templates
- Unique constraint (user + routine)

**template_uses**
- Tracks template adoption
- Analytics for creators

### Security (RLS Policies)
- Users can only access their own data
- Public routines/templates readable by all
- Premium-only template publishing
- Auto-created user_metadata on signup

### Automation (Triggers)
- Auto-update timestamps
- Auto-increment/decrement likes_count and uses_count
- Create user_metadata on new user signup
- Monthly AI generation reset for free users
- Prevent deletion of popular templates

### Performance (Indexes)
- Foreign key indexes on all relationships
- Composite indexes for common queries
- Partial indexes for public/featured content
- Sorting indexes for popularity rankings

## Authentication System

### Implementation
- **Context**: lib/contexts/AuthContext.tsx
- **Provider**: AuthProvider wraps entire app in app/_layout.tsx
- **Hook**: useAuth() for accessing auth state and functions

### Features
- Email/password authentication via Supabase Auth
- Automatic session persistence with AsyncStorage
- Protected routes (redirect to login if not authenticated)
- User-friendly error messages
- Haptic feedback on interactions
- Loading states during auth operations

### Screens
**Login (app/(auth)/login.tsx)**
- SaufeeLogo component (size 70)
- Email and password inputs
- AnimatedGradientButton for login
- "Forgot password" link (placeholder)
- "Sign up" link
- Full validation and error handling
- Haptic feedback

**Sign Up (app/(auth)/signup.tsx)**
- SaufeeLogo component (size 70)
- Display name, email, password, confirm password inputs
- AnimatedGradientButton for signup
- Password match validation
- Auto-creates users_metadata row via database trigger
- "Login" link for existing users
- Haptic feedback

### Routing Logic
- No session → Redirect to /(auth)/login
- Has session + in auth screens → Redirect to /
- Authenticated users can access protected routes

### Font Loading
- Inter fonts loaded asynchronously
- Splash screen shown during font loading
- Graceful error handling

## Subscription & Payments System

### Implementation
- **Service**: lib/payment-service.ts (RevenueCat SDK wrapper)
- **Context**: lib/contexts/SubscriptionContext.tsx
- **Provider**: SubscriptionProvider wraps app (after AuthProvider)
- **Hook**: useSubscription() for accessing subscription state
- **Helpers**: lib/utils/premium-helpers.ts

### Features
- RevenueCat integration for iOS and Android
- Automatic subscription status sync with Supabase
- Real-time purchase updates via webhook
- Restore purchases functionality
- Premium feature access control

### Products
**Monthly Subscription**
- Product ID: `saufee_premium_monthly`
- Price: $4.99/month
- Unlimited AI generations

**Annual Subscription**
- Product ID: `saufee_premium_annual`
- Price: $39.99/year
- Save $20 compared to monthly

### Entitlement
- **Identifier**: `premium`
- Grants access to all premium features

### Webhook Integration
- **Edge Function**: supabase/functions/revenuecat-webhook/index.ts
- Handles events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION
- Auto-updates users_metadata table subscription_tier and subscription_status
- Syncs RevenueCat purchases with Supabase database

### Error Handling
- User cancelled: Silent dismiss
- Payment failed: "Payment unsuccessful. Please try again."
- Network error: "Connection issue. Check internet and retry."
- Unknown error: Generic error message

### Helper Functions
- `useIsPremium()`: Check if user has premium access
- `useSubscriptionTier()`: Get current subscription tier
- `isPremiumTier()`: Check if tier is premium
- `getTierDisplayName()`: Get user-friendly tier name
- `getTierFeatures()`: Get list of features for tier
- `getPricingInfo()`: Get pricing details

## Branding Components

### SaufeeLogo (components/SaufeeLogo.tsx)
- Bold text logo: "saufee" in lowercase
- Uses Inter-Bold font
- Props: size (default 85), color (default #FF6B35)
- Proportional letter spacing: size * -0.035
- Single source of truth for text logo

### SaufeeIcon (components/SaufeeIcon.tsx)
- 3D raised platform app icon
- White background with subtle gradient (#ffffff to #f5f5f5)
- Orange gradient text (#FF6B35 to #FF8C5A)
- Uses MaskedView for gradient text effect
- Drop shadow for depth
- Props: size (default 280)
- Proportional scaling for all elements

### AnimatedGradientButton (components/AnimatedGradientButton.tsx)
- Continuous gradient animation (orange to white)
- Haptic feedback on press
- Scale animation on press (0.98)
- Loading and disabled states
- Props: onPress, children, disabled, style, textStyle
- Used for all primary CTAs

### Splash Screen (app/_layout.tsx)
- Custom animated splash screen
- Shows SaufeeLogo (size 100) with fade-in animation
- Displays for 1.5 seconds after fonts load
- Smooth fade-out transition to app content
- Background color matches BACKGROUND constant (#FAF9F6)
- Configured in app.json with splash.backgroundColor

### App Icon Generation (scripts/generate-icons.tsx)
- Helper screen to generate app icons at required sizes
- iOS sizes: 1024x1024, 180x180, 120x120, 76x76
- Android sizes: 512x512, 192x192, 96x96, 72x72, 48x48
- Renders SaufeeIcon at each size with dashed border
- Includes instructions for screenshot capture and asset creation
- Use react-native-view-shot or screenshot tools to capture icons

### ActivityBubble (components/ActivityBubble.tsx)
- Displays individual schedule activities in routine detail screen
- Shows time (12-hour format), activity name, and duration
- Swipe left to reveal delete button (red background with trash icon)
- Tap to edit activity details
- Bell icon on right for notifications (premium feature)
- Bell filled orange if notification enabled, gray outline if not
- Props: timeSlot, activity, duration, onPress, onDelete, isPremium, hasNotification, onNotificationPress
- Uses react-native-gesture-handler Swipeable for smooth swipe animation
- Haptic feedback on all interactions

### TemplateCard (components/TemplateCard.tsx)
- Displays template in marketplace with all relevant info
- **Header**: Title (bold, 18px) and category badge with color coding
- **Creator**: Shows "@username" for community templates
- **Description**: 2-line truncated description
- **Stats**:
  - Heart icon with like count (animated spring on tap)
  - Users icon with usage count
- **Category Colors**:
  - Work: Blue (#3B82F6)
  - Fitness: Green (#10B981)
  - Study: Purple (#8B5CF6)
  - Balanced: Orange (#F59E0B)
  - Lifestyle: Pink (#EC4899)
- **Actions**:
  - Like button with optimistic UI updates
  - "Use Template" gradient button
- **Props**: template object, onUse, onLike, showCreator
- **Animations**: Heart scales to 1.2 then back to 1 on like

### withPremiumGuard (components/withPremiumGuard.tsx)
- **Higher-Order Component (HOC)** for premium feature gating
- Wraps any component to make it premium-only
- **Free Users**: Shows blurred preview with upgrade overlay
  - Renders component at 0.3 opacity
  - Applies BlurView with customizable intensity (default: 10)
  - Shows centered modal with Lock icon
  - Customizable title and description
  - "Upgrade to Premium" button (navigates to paywall)
  - "Not now" button (navigates back)
  - Fade-in animation with 200ms delay
- **Premium Users**: Renders component normally
- **Loading State**: Shows spinner while checking subscription
- **Props**: Component to wrap, options object
- **Options**:
  - title (default: "Premium Feature")
  - description (default: "Unlock this feature to get the most out of Saufee...")
  - blurIntensity (default: 10)
- **Usage**: `export default withPremiumGuard(AnalyticsScreen, { title: "...", description: "..." });`
- **Dependencies**: expo-blur, useSubscription hook

### Toast (components/Toast.tsx)
- **Purpose**: Animated notification toast for user feedback
- **Features**:
  - Slides down from top with spring animation
  - Auto-dismisses after configurable duration (default: 2000ms)
  - Swipe up to dismiss manually
  - Three types: success (orange), error (red), info (gray)
  - White text, centered
- **Props**:
  - visible: boolean
  - type: 'success' | 'error' | 'info'
  - message: string
  - duration?: number (default 2000ms)
  - onDismiss: () => void
- **Usage**: Used in settings screen for immediate feedback
- **Examples**:
  - Success: "Settings saved ✓", "Profile updated ✓"
  - Error: "Unable to export data. Try again later."
  - Info: "PDF export coming soon!"

### EditProfile (components/EditProfile.tsx)
- **Purpose**: Full-screen modal for editing user profile
- **Features**:
  - Avatar management (upload, change, remove)
  - Display name editing
  - Image picker with camera and library options
  - Uploads to Supabase Storage avatars bucket
  - Saves to users_metadata table
- **Props**:
  - visible: boolean
  - onClose: () => void
  - userId: string
  - currentDisplayName: string
  - currentAvatarUrl?: string
  - onSuccess: (displayName: string, avatarUrl?: string) => void
- **Avatar Features**:
  - 120px circle with orange border
  - Shows initials if no avatar
  - Action sheet for photo options (iOS) or Alert (Android)
  - Options: "Take Photo", "Choose from Library", "Remove Photo"
  - Uploads with unique filename: {userId}_{timestamp}.{ext}
  - Stored in avatars/{filename}
  - Gets public URL from Supabase Storage
- **Validation**:
  - Display name required (cannot be empty)
  - Max length: 50 characters
- **Error Handling**:
  - Permission denied for camera/library
  - Upload failures
  - Save failures
- **Dependencies**: expo-image-picker, Supabase Storage

## AI Service (lib/ai-service.ts)

### Features
- Google Gemini 3.5 Flash integration
- Natural language to structured schedule conversion
- Free tier limit enforcement (3 generations/month)
- Premium-only optimization feature
- Comprehensive error handling

### Functions

**generateSchedule(brainDump: string, userId: string)**
- Checks user's subscription tier and AI usage
- Enforces 3 generation/month limit for free users
- Calls Claude API with structured prompt
- Parses JSON response with schedule data
- Validates response structure
- Inserts routine and schedules into Supabase
- Increments ai_generations_used for free users
- Returns: { success, data?: RoutineResponse, error?: ErrorObject }

**optimizeSchedule(routineId: string, userId: string)** (PREMIUM ONLY)
- Checks premium subscription status
- Fetches existing routine and schedules
- Sends to Claude for optimization analysis
- Returns 3-5 actionable suggestions with impact levels
- Returns: { success, data?: OptimizationResponse, error?: ErrorObject }

**getRemainingGenerations(userId: string)**
- Returns remaining AI generations for free users
- Returns -1 for premium (unlimited)
- Useful for UI display

### Error Handling
- LIMIT_REACHED: Free tier limit exceeded
- PREMIUM_REQUIRED: Premium feature attempted by free user
- API_ERROR: Authentication failure (401)
- RATE_LIMIT: Too many requests (429)
- NETWORK_ERROR: Connection issues
- PARSE_ERROR: Invalid JSON from Claude
- INVALID_RESPONSE: Malformed schedule data
- UNKNOWN_ERROR: Unexpected errors

### System Prompts
- Schedule generation: Structured JSON with realistic time allocations
- Optimization: 3-5 suggestions with impact levels (high/medium/low)

## Onboarding Flow (app/onboarding.tsx)

### Overview
Beautiful 3-screen horizontal swipeable onboarding shown once to new users, introducing Saufee's core value proposition and premium features.

### Implementation
- **File**: app/onboarding.tsx
- **Helpers**: lib/utils/onboarding-helpers.ts
- **Storage Key**: 'HAS_COMPLETED_ONBOARDING' in AsyncStorage
- **First-time check**: Root layout checks onboarding status on app load

### Screen 1: Welcome & Core Feature
**Layout**:
- White background
- Skip button (top-right, gray text)
- SaufeeLogo (size 80)
- Title: "Transform Chaos into Clarity" (bold, 28px, black)
- Description: "Brain dump your tasks in plain English..."
- Animated illustration: Chaos-to-clarity transformation
  - Chaotic text input flowing into organized calendar card
  - Uses Zap icon for transformation arrow
  - Calendar icon in card with orange glow
  - Animated opacity and translateY (looping)
- "Next" button (AnimatedGradientButton)
- Fade-in entrance animation

**Illustration Details**:
- Organized calendar card with orange Calendar icon
- Orange shadow glow effect
- Floating animation (2s loop)
- Below: Chaotic text example in gray bubble
- Zap icon connecting the two (transformation)

### Screen 2: AI-Powered Feature
**Layout**:
- Skip button (top-right)
- Title: "AI-Powered Schedules" (bold, 28px)
- Description: "Our smart AI understands natural language..."
- Animated illustration: AI sparkles around schedule
  - Sparkles icon with orange fill (rotating 360°, scaling 1-1.2)
  - Orange glow shadow around sparkles
  - Schedule preview card below with 3 activity bars
  - Schedule bars: orange with rounded corners
- "Next" button
- Staggered fade-in animations

**Illustration Details**:
- Sparkles icon: 80px, rotating continuously (3s)
- Pulsing scale animation (1.5s loop)
- Schedule preview: White card with 3 activity rows
- Each row: Time placeholder + orange activity bar

### Screen 3: Premium Pitch
**Layout**:
- NO skip button (final screen)
- Title: "Unlock Your Full Potential" (bold, 28px, ORANGE)
- Premium badge illustration:
  - Crown icon (80px, orange fill)
  - White circular background with orange shadow
  - Animated shine effect sliding across (2s loop)
- Premium features list (6 items with checkmarks):
  - ✓ Unlimited AI generations (CheckCircle icon, orange)
  - ✓ Smart schedule optimization
  - ✓ Analytics & insights
  - ✓ Export & calendar sync
  - ✓ Custom notifications
  - ✓ Share your templates
- Two action buttons:
  1. "Start Free Trial" (large, gradient button)
     - Marks onboarding complete
     - Navigates to (tabs)
     - Shows paywall after 500ms
  2. "Continue with Free" (text button, gray)
     - Marks onboarding complete
     - Navigates to (tabs)
- Legal links: "Terms • Privacy" (small, gray, bottom)
- Staggered FadeInDown animations (50ms delay per feature)

### Swipe Gestures & Navigation
**FlatList Configuration**:
- Horizontal scrolling with pagingEnabled
- 3 screens (full screen width each)
- Smooth animated transitions (200ms)
- Scroll indicator hidden
- Bouncing disabled for cleaner feel

**Skip Functionality**:
- Available on screens 1-2 only
- Taps skip → Jump to screen 3 (premium pitch)
- Cannot skip screen 3 (must choose trial or free)
- Haptic feedback on tap

**Next Button**:
- Available on screens 1-2
- Scrolls to next screen
- Haptic feedback on tap

### Page Indicators (Bottom Dots)
**Design**:
- 3 dots, bottom center (40px from bottom)
- Active dot: Orange, 10px diameter, opacity 1.0
- Inactive dots: Gray, 8px diameter, opacity 0.3
- Smooth spring animation on change

**Animation**:
- React Native Animated API for smooth interpolation
- Width and opacity interpolate based on scroll position
- Active state follows scroll gesture

### Onboarding State Management

**Helper Functions** (lib/utils/onboarding-helpers.ts):
- `hasCompletedOnboarding()`: Check if user completed onboarding
- `completeOnboarding()`: Mark onboarding as completed
- `resetOnboarding()`: Reset for testing purposes

**Root Layout Logic** (app/_layout.tsx):
1. On app load: Check AsyncStorage for 'HAS_COMPLETED_ONBOARDING'
2. If user authenticated:
   - hasCompletedOnboarding = false → Redirect to /onboarding
   - hasCompletedOnboarding = true → Redirect to /(tabs)
3. After signup: First-time users automatically see onboarding
4. After login: Returning users skip onboarding

**Flow**:
1. New user signs up
2. Root layout checks onboarding status (null or false)
3. User redirected to /onboarding
4. User completes onboarding → AsyncStorage updated
5. User navigates to /(tabs)
6. Next app open: onboarding skipped

### Animations & Polish

**Screen Transitions**:
- Horizontal slide with FlatList pagination
- Smooth deceleration (decelerationRate="fast")
- No bouncing for cleaner transitions

**Element Animations**:
- Logo: FadeInDown (100ms delay)
- Title: FadeInDown (200ms delay)
- Description: FadeInDown (300ms delay)
- Illustration: ZoomIn (400ms delay)
- Features list: Staggered FadeInDown (600ms + 50ms per item)
- Buttons: FadeInDown (700-900ms delay)

**Illustration Animations**:
- Screen 1: Opacity pulse + translateY bounce (looping)
- Screen 2: Sparkles rotate 360° + scale pulse (looping)
- Screen 3: Shine effect slides left to right (looping)

**Button Interactions**:
- Scale animation on press (0.98)
- Haptic feedback (Light/Medium impact)
- Loading states disabled during navigation

### Accessibility
- accessibilityLabel for all interactive elements
- accessibilityHint for swipe gestures
- High contrast text (black/orange on white)
- Respects system font sizes
- Large touch targets (buttons 56px min height)

### Legal & Links
- Terms of Service: Opens https://saufee.com/terms
- Privacy Policy: Opens https://saufee.com/privacy
- Links open in system browser (Linking.openURL)

### Testing & Debugging
- To reset onboarding: Call `resetOnboarding()` from utils
- To test flow: Clear AsyncStorage or call reset function
- To skip onboarding: Set 'HAS_COMPLETED_ONBOARDING' = 'true'

## Screens

### Brain Dump Screen (app/index.tsx)
- Main entry point for creating routines
- SaufeeLogo (size 60) at top
- Usage indicator for free users: "X of 3 free generations used this month"
- Premium badge for premium users: "Premium - Unlimited"
- Large multiline TextInput (200px min-height) with example placeholder
- AnimatedGradientButton "Generate Schedule" (56px height)
- Animations: screen fade-in, input focus scale, pulsing loading state
- Flow: validates input → checks free tier limit → calls AI service → navigates to routine detail or paywall
- Error handling: empty input, limit reached, API errors with specific messages

### Routine Detail Screen (app/routine/[id].tsx)
- Enhanced schedule viewing and editing interface
- **Header**: Back button, editable routine title, edit icon
- **Optimize Button**:
  - Free users: Shows "Optimize Schedule (Premium)" with lock icon, opens paywall
  - Premium users: Animated gradient button, calls AI optimization, shows suggestions modal
- **Schedule Display**:
  - Grouped by day (Monday through Sunday)
  - Staggered FadeInDown animations (50ms delay per day)
  - Uses ActivityBubble component for each activity
  - Pull-to-refresh with orange RefreshControl
- **Edit Capabilities**:
  - Edit routine title: Tap title or edit icon
  - Edit activity: Tap activity bubble, opens modal with name/time/duration fields
  - Delete activity: Swipe left on bubble, confirm deletion
  - Add activity: Tap FAB (+), select day, enter details
- **Floating Action Button (FAB)**:
  - Orange circle with + icon, bottom-right
  - Opens "Add Activity" modal
  - Day selector chips (Mon, Tue, Wed, etc.)
  - Time input (HH:MM format)
  - Duration input (minutes)
- **Premium Features**:
  - Optimize Schedule: AI-powered suggestions with impact levels (high/medium/low)
  - Custom Notifications: Bell icon on activities (shows paywall for free users)
- **Modals**:
  - Edit Title: Simple text input
  - Edit Activity: Name, time, duration fields
  - Add Activity: Day chips, name, time, duration
  - Optimization Suggestions: Scrollable list with colored impact badges
- **State Management**: Supabase real-time updates, optimistic UI updates
- **Error Handling**: Loading states, error alerts, confirmation dialogs

### Paywall Screen (app/paywall.tsx)
- Conversion-optimized design
- Close button (X) in top-right
- Header: "Unlock Your Full Potential" (orange, bold, 28px)
- 6 Premium Features with staggered FadeInDown animations (50ms delay):
  1. Unlimited AI Generations (Infinity icon)
  2. Smart Optimization (Sparkles icon)
  3. Analytics & Insights (BarChart3 icon)
  4. Export & Share (Share2 icon)
  5. Custom Notifications (Bell icon)
  6. Premium Templates (Grid icon)
- Pricing cards: Monthly ($4.99/month) and Annual ($39.99/year)
- Annual plan highlighted with "Save 33%" badge and orange border
- AnimatedGradientButton for purchases
- Complete error handling (silent for user cancellation)
- Restore purchases functionality
- Legal links (Terms of Service • Privacy Policy)
- Subscription disclaimer

### Templates Screen (app/(tabs)/templates.tsx)
- Tab-based navigation with two sections: Official and Community
- **Official Templates**:
  - 5 curated templates (Busy Professional, Student Life, Fitness Focus, Balanced Lifestyle, Entrepreneur Grind)
  - Pre-fills brain dump input when user taps "Use Template"
  - Hard-coded, no database required
- **Community Templates**:
  - Real-time template browsing with Supabase Realtime subscriptions
  - Search bar with live filtering by title, category, or creator
  - Sort options: Most Popular (likes_count DESC), Recently Added (created_at DESC)
  - Category filters: All, Work, Fitness, Study, Balanced, Lifestyle
  - Infinite scroll pagination (20 templates per page)
  - Pull-to-refresh with orange RefreshControl
  - Uses TemplateCard component for each template
  - Like/unlike functionality with optimistic UI updates
  - Template usage tracking and copying to user's routines
- **Empty States**:
  - "No templates yet. Be the first to share!" for empty community
  - "No templates found. Try different keywords." for empty search results

### Settings Screen (app/(tabs)/settings.tsx)
Comprehensive settings screen with profile management, subscription details, notifications, data privacy, and app info.

**Section 1: Profile (Bubble Card)**
- **User Avatar**: 100px circle with orange border
  - Displays current avatar from users_metadata.avatar_url
  - If no avatar: Shows initials on orange background
  - Uploaded via expo-image-picker to Supabase Storage
- **Display Name**: Editable, fetched from users_metadata
- **Email**: Non-editable, from auth.users
- **Edit Profile Button**: Opens EditProfile modal
  - Change display name input
  - Upload/change/remove avatar functionality
  - Take photo or choose from library
  - Uploads to Supabase Storage avatars bucket
  - Saves to users_metadata (display_name, avatar_url)

**Section 2: Subscription (Bubble Card)**
- **For FREE users**:
  - "Current Plan: Free" heading
  - Features list: "3 AI generations per month", "Basic schedules"
  - Visual usage progress bar (orange fill)
  - Text: "{X}/3 generations used" (from users_metadata.ai_generations_used)
  - "Upgrade to Premium" button (gradient, navigates to paywall)
  - "Restore Purchases" text button
- **For PREMIUM users**:
  - "Current Plan: Premium ⭐" heading with crown icon
  - Subscription type display: "Monthly" or "Annual"
  - "Manage Subscription" button (opens RevenueCat customer center)
  - Shows next billing date (from RevenueCat)

**Section 3: Notifications (Bubble Card)**
- **Push Notifications Toggle**: Orange when enabled
  - Enables/disables all notifications
  - Saves to users_metadata.notifications_settings
- **Configure Reminders Row**:
  - Opens NotificationSettings modal
  - Free users: Lock icon, tap opens paywall
  - Premium users: Opens full notification configuration modal

**Section 4: Data & Privacy (Bubble Card)**
- **Export My Data Row**:
  - Shows action sheet with options:
    - "Routines as PDF" (planned)
    - "Schedules as CSV" (planned)
    - "Full Data Export (JSON)" (planned)
  - Currently shows "coming soon" toast
- **Delete All Routines Row**:
  - Orange warning confirmation dialog
  - Deletes all user's routines from Supabase
  - Success toast on completion
- **Delete Account Row** (Destructive):
  - First confirmation: "This will permanently delete your account"
  - Second confirmation: "Are you absolutely sure?" (final warning)
  - On double-confirm:
    - Deletes all routines, schedules, analytics, templates
    - Deletes users_metadata
    - Deletes Supabase auth account
    - Signs out and navigates to login

**Section 5: App Info (Bubble Card)**
- **Privacy Policy Row**: Opens browser to https://saufee.com/privacy
- **Terms of Service Row**: Opens browser to https://saufee.com/terms
- **Contact Support Row**:
  - Opens email client
  - Pre-filled: to='support@saufee.com', subject='Saufee Support Request'
- **Rate Saufee Row**:
  - Opens App Store (iOS) or Play Store (Android) using expo-store-review
  - Requests in-app review when available
- **App Version Row**:
  - Displays "1.0.0" (from app.json)
  - Non-interactive, gray text

**Section 6: Account Actions (Bubble Card)**
- **Logout Button**: Full-width, orange outline
  - Shows confirmation dialog
  - On confirm: Signs out via AuthContext, clears session, navigates to login

**Components Used**:
- **EditProfile Modal** (components/EditProfile.tsx):
  - Full-screen modal
  - Avatar section with change/remove photo options
  - Display name input field
  - Save button (gradient)
  - Uploads images to Supabase Storage
  - Updates users_metadata on save
- **Toast Component** (components/Toast.tsx):
  - Animated toast that slides from top
  - Types: success (orange), error (red), info (gray)
  - White text, centered
  - Auto-dismisses after 2 seconds
  - Swipe up to dismiss early
  - Used for: "Settings saved ✓", "Profile updated ✓", error messages

**Interactions & Animations**:
- Each row has subtle press animation (activeOpacity: 0.7)
- Toggle switches use spring physics
- Confirmation dialogs slide up from bottom
- All dialogs use rounded bubble style
- Orange buttons for actions
- Red buttons for destructive actions (delete account)

**Data Persistence**:
- All settings save to Supabase immediately
- Success toast shown after save: "Settings saved ✓"
- Toast slides down from top, auto-dismisses

**Error Handling**:
- Export fails: "Unable to export data. Try again later."
- Delete fails: "Unable to delete. Check connection."
- Subscription management fails: "Unable to manage subscription. Contact support."
- All errors shown in toast with appropriate type

### Analytics Screen (app/(tabs)/analytics.tsx) **PREMIUM ONLY**
- **Premium Guard HOC**: Entire screen wrapped with withPremiumGuard
  - Free users see blurred preview with "Upgrade to Premium" overlay
  - Lock icon, custom title/description, haptic feedback
- **Header**: Saufee logo, "Analytics" title, Share button
- **Metrics Cards (2x2 Grid)**:
  - Completion Rate: Percentage of completed activities (green CheckCircle icon)
  - Current Streak: Consecutive days of completions (orange Flame icon)
  - Total Activities: Count of all scheduled activities (blue CheckCircle icon)
  - Most Productive Time: Morning/Afternoon/Evening (purple Clock icon)
- **Charts**:
  - Weekly Activity Distribution: Bar chart showing activities per day (Mon-Sun)
  - Activity Categories: Pie chart with color-coded categories (Fitness, Work, Study, Social, Other)
  - Time of Day Distribution: Horizontal bar chart showing Morning/Afternoon/Evening activity counts
- **Data Sources**:
  - Fetches from routines, schedules, and routine_analytics tables
  - Real-time calculations for streak and completion rate
  - Automatic categorization of activities based on keywords
- **Empty State**: Shows when user has no routines/activities yet
- **Share Functionality**: Generates shareable analytics summary
- **Dependencies**: react-native-chart-kit, react-native-svg

### Share Template Feature (app/routine/[id].tsx)
- **Share Button**: Added to routine detail header (next to Optimize button)
- **Premium Only**: Free users see paywall when tapping Share
- **Modal Flow**:
  - Category selector chips (work, fitness, study, balanced, lifestyle)
  - Optional description textarea
  - "Publish" button to make routine public
- **Database Operations**:
  - Sets routine.is_public = true
  - Inserts record into public_templates table with creator info
  - Tracks template in community marketplace
- **Success Feedback**: "🎉 Template Published!" alert with confetti
- **Duplicate Prevention**: Checks if routine already published (unique constraint)

## Notification System (Premium Feature)

### Implementation
- **Service**: services/notification-service.ts (expo-notifications wrapper)
- **Component**: components/NotificationSettings.tsx (full-screen modal)
- **Integration**: Bell icons in ActivityBubble, Settings screen option
- **Premium Only**: All notification features require premium subscription

### Notification Types

**Activity Reminders**
- Scheduled before each activity based on user preference (5/10/15/30/60 minutes)
- Weekly repeating notifications for recurring activities
- Title: "🔔 {activityName} Coming Up"
- Body: "Starting in {X} minutes at {time}"
- Data payload includes activityId for navigation
- Can be enabled per-activity or for all activities at once

**Daily Digest**
- Morning summary notification sent at user-configured time (default: 8:00 AM)
- Title: "Good Morning! 🌅"
- Body: "Here's your schedule for today"
- Daily repeating notification

**Completion Reminder**
- End-of-day check-in sent at user-configured time (default: 9:00 PM)
- Title: "Day Review Time 🌙"
- Body: "Review and complete your daily activities"
- Daily repeating notification

### Service Functions (services/notification-service.ts)

**requestPermissions()**
- Requests notification permissions on app start (iOS and Android)
- Creates Android notification channel "saufee-reminders" with high importance
- Returns boolean: granted or denied
- Called automatically when user logs in (app/_layout.tsx)

**scheduleActivityNotification(activityId, activityName, dayOfWeek, scheduledTime, advanceMinutes)**
- Schedules weekly repeating notification for a specific activity
- Calculates trigger time based on activity time minus advance minutes
- Stores notification ID in AsyncStorage for tracking
- Returns notification ID string
- Notification ID also saved to schedules.notification_id column

**cancelActivityNotification(notificationId)**
- Cancels a specific scheduled notification
- Removes from system notification queue

**cancelAllNotifications()**
- Cancels all scheduled notifications
- Clears AsyncStorage notification mappings
- Called when user disables notifications or downgrades to free

**scheduleDailyDigest(time)**
- Schedules daily repeating notification at specified time (HH:MM format)
- Cancels existing daily digest if present
- Stores notification ID in AsyncStorage

**cancelDailyDigest()**
- Cancels daily digest notification

**scheduleCompletionReminder(time)**
- Schedules daily repeating notification at specified time (HH:MM format)
- Cancels existing completion reminder if present
- Stores notification ID in AsyncStorage

**cancelCompletionReminder()**
- Cancels completion reminder notification

**getScheduledNotifications()**
- Returns array of all pending notifications
- Useful for debugging and displaying scheduled notifications

**getNotificationId(activityId)**
- Retrieves notification ID for a specific activity from AsyncStorage
- Returns null if no notification scheduled

**removeNotificationId(activityId)**
- Removes notification ID mapping from AsyncStorage

### NotificationSettings Modal (components/NotificationSettings.tsx)

**Props**
- visible: boolean - Modal visibility state
- onClose: () => void - Close handler
- userId: string - Current user ID
- activityId?: string - Optional specific activity ID
- activityName?: string - Optional activity name
- dayOfWeek?: number - Optional day of week (0-6)
- timeSlot?: string - Optional time slot (HH:MM)

**Sections**

1. **Activity Reminders**
   - Enable Reminders toggle (premium-only)
   - Advance minutes selector (5/10/15/30/60 minutes)
   - Apply to all activities toggle
   - When enabled for single activity: schedules notification for that activity
   - When "Apply to all" enabled: schedules notifications for all user's activities

2. **Daily Digest**
   - Morning Summary toggle (premium-only)
   - Time display (currently not editable, default 8:00 AM)
   - Schedules daily repeating notification

3. **Completion Reminders**
   - End of Day Check-in toggle (premium-only)
   - Time display (currently not editable, default 9:00 PM)
   - Schedules daily repeating notification

**Free User Behavior**
- All toggles disabled and grayed out
- Lock icons displayed next to each toggle
- Tapping any toggle navigates to paywall
- Modal shows but user cannot enable features

**Premium User Behavior**
- All toggles functional
- Preferences saved to users_metadata.notifications_settings (JSONB)
- Notification IDs saved to schedules.notification_id column
- Real-time scheduling via expo-notifications

**Data Structure (users_metadata.notifications_settings)**
```json
{
  "enabled": true,
  "advance_minutes": 15,
  "apply_to_all": true,
  "daily_digest": true,
  "daily_digest_time": "08:00",
  "completion_reminder": true,
  "completion_time": "21:00"
}
```

### Integration Points

**ActivityBubble Component (components/ActivityBubble.tsx)**
- Bell icon on right side of each activity card
- Orange filled bell if notification enabled (hasNotification prop)
- Gray outline bell if notification disabled
- Tapping bell:
  - Free users: Navigate to paywall
  - Premium users: Open NotificationSettings modal for that activity
- Props: hasNotification, onNotificationPress, isPremium

**Routine Detail Screen (app/routine/[id].tsx)**
- Schedule interface includes notification_id field
- Bell icon on each ActivityBubble
- handleNotificationPress opens NotificationSettings modal
- Passes activity details to modal (id, name, day, time)
- Refreshes data after closing modal to show updated notification status

**Settings Screen (app/(tabs)/settings.tsx)**
- "Notification Settings" option in Preferences section
- Bell icon next to option
- Lock icon for free users
- Tapping option:
  - Free users: Navigate to paywall
  - Premium users: Open NotificationSettings modal (global settings)
- Opens modal without specific activity (global configuration)

**Root Layout (app/_layout.tsx)**
- Requests notification permissions on user login
- Sets up notification listeners:
  - Foreground notification listener (logs to console)
  - Notification tap listener (navigates based on type)
- Navigation handling:
  - activity_reminder: Navigate to routine detail (TODO: implement routine lookup)
  - daily_digest: Navigate to home tab
  - completion_reminder: Navigate to analytics tab
- Listeners cleaned up on component unmount

### Notification Permissions

**iOS**
- Requests provisional authorization on first launch
- User can grant/deny in system settings
- Badge, sound, and alert permissions requested
- Notifications work when app is closed

**Android**
- Creates notification channel "saufee-reminders"
- Channel importance: HIGH
- Vibration pattern: [0, 250, 250, 250]
- Light color: #FF6B35 (PRIMARY_ORANGE)
- Default sound and vibration
- Badge support enabled

### Edge Cases & Error Handling

**App Closed**
- Notifications fire even when app is closed
- Tapping notification opens app and navigates to relevant screen

**Timezone Changes**
- Notifications currently use local time
- TODO: Consider rescheduling all notifications on timezone change

**Activity Deleted**
- Notification ID stored in schedules table
- When activity deleted, notification should be cancelled
- Currently handled by cascade delete or manual cleanup

**Routine Deleted**
- All associated activity notifications cancelled
- Handled by cascade delete of schedules

**User Downgrades to Free**
- cancelAllNotifications() called
- All notification settings disabled
- Notification IDs cleared from database
- User must re-enable when upgrading back to premium

**Permission Denied**
- requestPermissions returns false
- User can still configure settings (will be saved)
- Notifications won't fire until permission granted
- User must enable in system settings manually

**Notification Scheduling Failures**
- All schedule functions return null on error
- Errors logged to console for debugging
- User sees success message even if scheduling fails (graceful degradation)
- TODO: Add better error feedback to user

### Testing Checklist

- [ ] Test immediate notification (1 second delay) for debugging
- [ ] Test weekly repeating notifications
- [ ] Test daily repeating notifications
- [ ] Test notification cancellation
- [ ] Test app opens from notification tap
- [ ] Test navigation from notification data
- [ ] Test free user paywall flow
- [ ] Test premium user full flow
- [ ] Test "Apply to all activities" functionality
- [ ] Test activity deletion cancels notification
- [ ] Test routine deletion cancels all notifications
- [ ] Test user downgrade cancels all notifications
- [ ] Test timezone changes (if implemented)
- [ ] Test Android notification channel
- [ ] Test iOS notification permissions

## Core Features

### Implemented
✅ Authentication (email/password via Supabase)
✅ Subscription management (RevenueCat integration)
✅ AI schedule generation (Claude Sonnet 4)
✅ Free tier limit enforcement (3/month)
✅ Premium features (schedule optimization, template sharing, notifications)
✅ Branding components (logo, icon, buttons, splash screen)
✅ Node.js polyfills for Supabase realtime
✅ 3-screen onboarding flow for new users
✅ Onboarding state management with AsyncStorage
✅ Animated illustrations on onboarding screens
✅ Skip functionality and swipeable screens
✅ Brain dump screen with usage tracking
✅ Routine detail screen with full CRUD operations
✅ Edit/delete activities with swipe gestures
✅ Add manual activities with FAB
✅ AI-powered schedule optimization (premium)
✅ Community templates marketplace with real-time updates
✅ Official curated templates
✅ Template browsing with search and filters
✅ Template creation and sharing (premium)
✅ Template likes and usage tracking
✅ Conversion-optimized paywall
✅ Purchase flow with success/error handling
✅ Tab navigation (Home, Templates, Analytics, Settings)
✅ Analytics dashboard (premium-only)
✅ Premium guard HOC for feature gating
✅ Metrics cards with completion rate and streaks
✅ Charts (bar, pie, horizontal bars)
✅ Push notifications system (premium-only)
✅ Activity reminders with configurable advance time
✅ Daily digest notifications
✅ Completion reminder notifications
✅ Per-activity notification configuration
✅ Global notification settings in Settings screen
✅ Notification permission handling (iOS & Android)
✅ Notification listeners and navigation
✅ Android notification channels
✅ Comprehensive settings screen with 6 sections
✅ Profile management with avatar upload
✅ EditProfile modal component
✅ Toast notification component
✅ Supabase Storage integration for avatars
✅ Subscription details display
✅ Usage progress bar for free users
✅ Data export options (planned functionality)
✅ Delete all routines functionality
✅ Delete account functionality with double-confirmation
✅ Privacy policy and terms links
✅ Contact support email integration
✅ Rate app integration (expo-store-review)
✅ Logout with confirmation

### Planned
- Export to PDF, CSV, and JSON (data export implementation)
- Template moderation and reporting
- User profiles with public templates showcase
- Time picker for daily digest and completion reminder times
- Better error handling for notification scheduling failures
- Routine lookup from activity notification tap
- Manage subscription via RevenueCat customer center
- Next billing date display for premium users

## Configuration Notes

### Babel (babel.config.js)
- Configured for Expo SDK 54
- Uses babel-preset-expo
- Includes react-native-reanimated/plugin (must be last in plugins array)
- NO expo-router/babel (deprecated in SDK 50+)

### Metro (metro.config.js)
- Configured Node.js polyfills for Supabase realtime
- Maps 12 Node.js modules to browser-compatible versions
- Required for WebSocket support in React Native

### Shim (shim.js)
- Global polyfills for Buffer and process
- Imported at top of lib/supabase.ts
- Required for runtime compatibility

### App.json
- Deep linking scheme: "saufee"
- Notification permissions configured for iOS (UIBackgroundModes: remote-notification)
- Android permissions: RECEIVE_BOOT_COMPLETED, VIBRATE, WAKE_LOCK, POST_NOTIFICATIONS
- Plugins: expo-router, expo-font
- New architecture enabled

### Package.json
- Entry point: expo-router/entry
- All packages installed with --legacy-peer-deps due to React 19 compatibility

### Environment Variables (.env)
- EXPO_PUBLIC_SUPABASE_URL - Supabase project URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
- EXPO_PUBLIC_GEMINI_API_KEY - Google Gemini API key for AI generation
- EXPO_PUBLIC_REVENUECAT_APPLE_KEY - RevenueCat iOS key
- EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY - RevenueCat Android key

### Installation Notes
- All packages installed with --legacy-peer-deps due to React 19.1.0
- react-native-purchases version 8.1.3 not available, installed latest (9.6.12)
- Package versions matched to Metro bundler expected versions for compatibility
- StatusBar style: auto

### Android Testing Setup
1. Installed all Node.js polyfills for Supabase realtime WebSocket support
2. Configured metro.config.js with module resolution
3. Created shim.js for global polyfills
4. Added deep linking scheme to app.json
5. Successfully tested on Android emulator via Expo Go

### Known Issues Fixed
- expo-router/babel deprecated → Removed, use babel-preset-expo only
- Node.js module errors → Installed 12 polyfills + configured metro
- Version mismatches → Installed exact versions from Metro bundler output
- Linking scheme warning → Added "scheme": "saufee" to app.json

### Supabase Database Setup
1. Create a Supabase project
2. Run SQL files in order:
   - supabase/01_schema.sql (create tables)
   - supabase/02_rls_policies.sql (enable security)
   - supabase/03_triggers.sql (automation)
   - supabase/04_indexes.sql (performance)
   - supabase/05_storage.sql (storage buckets and policies)
3. Copy project URL and anon key to .env file
4. For monthly AI generation reset, consider setting up pg_cron (see triggers file)
5. Configure Storage settings in Supabase Dashboard:
   - Max file size for avatars bucket: 5MB
   - Allowed file types: image/jpeg, image/png, image/webp
