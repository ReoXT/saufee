# Saufee - AI-Powered Routine Planner

## Project Overview
Saufee is an AI-powered routine planner mobile app where users describe their week in plain English and AI generates structured schedules.

## Tech Stack
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: expo-router v3.5.23 (file-based routing)
- **React**: v19.1.0
- **React Native**: v0.81.5

## Project Structure
```
Saufee/
├── app/                      # File-based routing screens
│   ├── _layout.tsx          # Root layout with Stack navigator
│   └── index.tsx            # Home screen (welcome screen)
├── components/              # Reusable UI components
├── lib/                     # Services, contexts, utilities
├── services/                # Background services (notifications, etc.)
├── types/                   # TypeScript type definitions
├── constants/
│   ├── theme.ts            # Design tokens
│   └── config.ts           # App configuration
├── assets/
│   ├── fonts/              # Inter font files (Regular, Medium, Bold)
│   └── illustrations/      # Empty state illustrations
└── babel.config.js         # Configured for expo-router
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
- expo-router@3.5.23 (file-based routing)
- react-native-safe-area-context@4.10.5
- react-native-screens@3.31.1

### Animation & UI
- react-native-reanimated@3.10.1 (smooth animations)
- expo-linear-gradient@13.0.2 (gradient backgrounds)
- expo-haptics@13.0.1 (haptic feedback)
- react-native-svg@15.2.0 (SVG support)

### Data & Storage
- @supabase/supabase-js@2.45.4 (backend & database)
- @react-native-async-storage/async-storage@1.23.1 (local storage)

### Notifications & Permissions
- expo-notifications@0.28.16 (push notifications)

### Media & Files
- expo-image-picker@15.0.7 (image selection)

### Fonts & Icons
- expo-font@12.0.9 (custom font loading)
- lucide-react-native@0.446.0 (icon library)

### Charts & Visualization
- react-native-chart-kit@6.12.0 (data visualization)

### Payments
- react-native-purchases@9.6.12 (in-app purchases, RevenueCat)

### Utilities
- @react-native-masked-view/masked-view@0.3.1 (UI masking)
- react-native-url-polyfill (required for Supabase)

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

## Core Features (Planned)
- Plain English routine input
- AI-powered schedule generation (Anthropic API)
- Structured weekly planning
- Free tier: 3 AI generations per month
- Premium tier: Unlimited generations + template publishing
- Public template marketplace
- Analytics and completion tracking
- Push notifications for activities

## Configuration Notes

### Babel (babel.config.js)
- Configured for expo-router
- Includes react-native-reanimated/plugin (must be last in plugins array)

### App.json
- Notification permissions configured for iOS (UIBackgroundModes: remote-notification)
- Android permissions: RECEIVE_BOOT_COMPLETED, VIBRATE, WAKE_LOCK, POST_NOTIFICATIONS
- Plugins: expo-router, expo-font

### Package.json
- Entry point: expo-router/entry
- Some packages installed with --legacy-peer-deps due to React 19 compatibility

### Environment Variables (.env)
- EXPO_PUBLIC_SUPABASE_URL - Supabase project URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
- EXPO_PUBLIC_ANTHROPIC_API_KEY - Anthropic API key for AI generation
- EXPO_PUBLIC_REVENUECAT_APPLE_KEY - RevenueCat iOS key
- EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY - RevenueCat Android key

### Installation Notes
- lucide-react-native, react-native-chart-kit, react-native-purchases, and masked-view required --legacy-peer-deps flag
- react-native-purchases version 8.1.3 not available, installed latest (9.6.12)
- StatusBar style: auto

### Supabase Database Setup
1. Create a Supabase project
2. Run SQL files in order:
   - supabase/01_schema.sql (create tables)
   - supabase/02_rls_policies.sql (enable security)
   - supabase/03_triggers.sql (automation)
   - supabase/04_indexes.sql (performance)
3. Copy project URL and anon key to .env file
4. For monthly AI generation reset, consider setting up pg_cron (see triggers file)
