# Noor App State Machine Diagram

> **Last Updated:** 2026-01-17
> **Note:** This document should be updated whenever component changes are made.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOOR APP STATE MACHINE                       │
│            React Native/Expo Islamic Companion App              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. App Initialization Flow

```
                         ┌─────────────────┐
                         │   APP START     │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Load Providers:        │
                    │  • QueryClientProvider  │
                    │  • OnboardingProvider   │
                    │  • AppProvider          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Check AsyncStorage:    │
                    │  isOnboardingComplete?  │
                    │  isLoading = true       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                   NO                        YES
                    │                         │
                    ▼                         ▼
            ┌──────────────┐          ┌──────────────┐
            │  ONBOARDING  │          │   MAIN APP   │
            │    FLOW      │          │   (TABS)     │
            │  (16 steps)  │          │              │
            └──────────────┘          └──────────────┘
```

---

## 2. Onboarding Flow State Machine (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING STATE MACHINE                      │
│                     16 Sequential Screens                        │
│                                                                  │
│  PHASE 1: Welcome & Credibility (0-2)                           │
│  PHASE 2: User Profile (3-7)                                    │
│  PHASE 3: Spiritual Journey (8-11)                              │
│  PHASE 4: App Setup (12-15)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1: Welcome & Credibility

```
┌─────────────┐
│  WELCOME    │  Step 0/16
│  (Entry)    │
├─────────────┤
│ Display:    │
│ • بِسْمِ اللَّهِ │
│ • App title │
│ • Tagline   │
│ • Animation │
└──────┬──────┘
       │ "Get Started"
       ▼
┌─────────────┐
│  FEATURES   │  Step 1/16
│             │
├─────────────┤
│ Display:    │
│ • Prayer times
│ • Qibla     │
│ • Daily inspiration
│ • Habit tracking
│             │
│ Animated    │
│ feature     │
│ cards       │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│   STATS     │  Step 2/16
│ (Credibility)│
├─────────────┤
│ Display:    │
│ • 100K+ users
│ • 150+ countries
│ • 4.9 rating │
│             │
│ Hadith quote │
│ about Quran │
└──────┬──────┘
       │ "Continue"
       ▼
```

### Phase 2: User Profile

```
┌─────────────┐
│    NAME     │  Step 3/16
│             │
├─────────────┤
│ Input:      │
│ • Text field│
│ • "Assalamu │
│   Alaikum!" │
│             │
│ Stores:     │
│ userProfile │
│   .name     │
└──────┬──────┘
       │ "Continue" or "Skip"
       ▼
┌─────────────┐
│   GENDER    │  Step 4/16
│             │
├─────────────┤
│ Options:    │
│ • Brother   │
│ • Sister    │
│ • Prefer not│
│             │
│ Stores:     │
│ userProfile │
│   .gender   │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│    AGE      │  Step 5/16
│             │
├─────────────┤
│ Options:    │
│ • 13-17     │
│ • 18-24     │
│ • 25-34     │
│ • 35-44     │
│ • 45-54     │
│ • 55+       │
│             │
│ Stores:     │
│ userProfile │
│   .ageRange │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│ MOTIVATION  │  Step 6/16
│(Multi-select)│
├─────────────┤
│ Options:    │
│ • Prayer times
│ • Quran connection
│ • Build habits
│ • Learn more │
│ • Community  │
│ • Spiritual growth
│ • Ramadan prep
│ • New Muslim │
│             │
│ Stores:     │
│ userProfile │
│ .motivations│
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│ LIFE STAGE  │  Step 7/16
│             │
├─────────────┤
│ Options:    │
│ • Student   │
│ • Early career
│ • Established
│ • Parent    │
│ • Retired   │
│ • Other     │
│             │
│ Stores:     │
│ userProfile │
│   .lifeStage│
└──────┬──────┘
       │ "Continue"
       ▼
```

### Phase 3: Spiritual Journey

```
┌─────────────┐
│  QUOTE 1    │  Step 8/16
│ (Transition)│
├─────────────┤
│ Display:    │
│ إِنَّ مَعَ الْعُسْرِ
│    يُسْرًا   │
│ "With hard- │
│  ship comes │
│  ease"      │
│ — Surah     │
│   Ash-Sharh │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│ EXPERIENCE  │  Step 9/16
│             │
├─────────────┤
│ Options:    │
│ 🌱 New to Islam
│ 🌿 Growing  │
│ 🌳 Practicing
│ 🕌 Knowledgeable
│             │
│ Stores:     │
│ userProfile │
│ .islamicExperience
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│ COMMITMENT  │  Step 10/16
│             │
├─────────────┤
│ Options:    │
│ • Exploring │
│   (مستكشف)   │
│ • Building  │
│   habits    │
│   (متطور)    │
│ • Consistent│
│   (ملتزم)    │
│ • Devoted   │
│   (مُخلص)    │
│             │
│ Stores:     │
│ userProfile │
│ .commitmentLevel
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│  QUOTE 2    │  Step 11/16
│(Personalized)│
├─────────────┤
│ Display:    │
│ "[Name],    │
│  you're not │
│  alone"     │
│             │
│ Hadith about│
│ taking      │
│ benefit of  │
│ time        │
│             │
│ Animated    │
│ circles     │
└──────┬──────┘
       │ "Let's Set Up Noor"
       ▼
```

### Phase 4: App Setup

```
┌─────────────┐
│  LOCATION   │  Step 12/16
│             │
├─────────────┤
│ Actions:    │
│ • Auto-detect (GPS)
│ • Manual entry
│             │
│ Stores:     │
│ • latitude  │
│ • longitude │
│ • cityName  │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│ CALCULATION │  Step 13/16
│   METHOD    │
├─────────────┤
│ Options:    │
│ • ISNA      │
│ • MWL       │
│ • Egyptian  │
│ • Umm al-Qura
│             │
│ Auto-select │
│ based on    │
│ city name   │
└──────┬──────┘
       │ "Continue"
       ▼
┌─────────────┐
│NOTIFICATIONS│  Step 14/16
│             │
├─────────────┤
│ Configure:  │
│ • Enabled   │
│ • Prayers[] │
│ • Reminder  │
│   minutes   │
└──────┬──────┘
       │ "Enable" or "Maybe Later"
       ▼
┌─────────────┐
│   READY     │  Step 15/16
│ (Complete)  │
├─────────────┤
│ Display:    │
│ • "[Name],  │
│   You're    │
│   All Set!" │
│ • Summary   │
│ • Location  │
│ • Method    │
│ • Next prayer
│ • Quran quote
└──────┬──────┘
       │ "Start My Journey"
       ▼
┌─────────────────────────────┐
│ completeOnboarding()        │
│ • isOnboardingComplete=true │
│ • Save userProfile          │
│ • Save to AsyncStorage      │
│ • router.replace('/(tabs)') │
└─────────────────────────────┘
       │
       ▼
    [MAIN APP]
```

---

## 3. Onboarding Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER PROFILE DATA FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Screen          │ Data Updated            │ Provider Action
────────────────┼─────────────────────────┼────────────────────────
name            │ userProfile.name        │ updateUserProfile()
gender          │ userProfile.gender      │ updateUserProfile()
age             │ userProfile.ageRange    │ updateUserProfile()
motivation      │ userProfile.motivations │ updateUserProfile()
lifestage       │ userProfile.lifeStage   │ updateUserProfile()
experience      │ userProfile.islamicExp  │ updateUserProfile()
commitment      │ userProfile.commitment  │ updateUserProfile()
location        │ onboardingData.location │ setLocationData()
calculation     │ onboardingData.calcMethod│ setCalculationMethod()
notifications   │ onboardingData.notifs   │ setNotificationSettings()
ready           │ All data finalized      │ completeOnboarding()
```

---

## 4. Main App Tab Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN APP TAB NAVIGATION                       │
│                      5 Bottom Tabs                               │
└─────────────────────────────────────────────────────────────────┘

                         ┌─────────────┐
                         │  TAB BAR    │
                         └──────┬──────┘
                                │
    ┌───────────┬───────────┬───┴───┬───────────┬───────────┐
    │           │           │       │           │           │
    ▼           ▼           ▼       ▼           ▼           ▼
┌───────┐  ┌───────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ HOME  │  │PRAYER │  │ TASBIH  │  │ TRACKER │  │ JOURNAL │
│(index)│  │       │  │         │  │         │  │         │
└───┬───┘  └───┬───┘  └────┬────┘  └────┬────┘  └────┬────┘
    │          │           │            │            │
    ▼          ▼           ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│Daily   │ │Prayer  │ │Counter  │ │Status    │ │Entry     │
│Content │ │Times   │ │+ Dhikr  │ │Tracking  │ │List/Write│
│Display │ │+ Qibla │ │Sessions │ │          │ │          │
└────────┘ └────────┘ └─────────┘ └──────────┘ └──────────┘
```

---

## 5. Provider/Context Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROVIDER HIERARCHY                            │
└─────────────────────────────────────────────────────────────────┘

RootLayout (_layout.tsx)
│
├── QueryClientProvider (TanStack React Query)
│   │
│   └── GestureHandlerRootView
│       │
│       └── OnboardingProvider
│           │   State:
│           │   • isOnboardingComplete (boolean)
│           │   • isLoading (boolean)
│           │   • onboardingData (object)
│           │   • userProfile (UserProfile)
│           │
│           │   Actions:
│           │   • checkOnboardingStatus()
│           │   • updateUserProfile()      ← NEW
│           │   • setLocationData()
│           │   • setCalculationMethod()
│           │   • setNotificationSettings()
│           │   • completeOnboarding()
│           │   • resetOnboarding()
│           │
│           └── AppProvider
│               │   State:
│               │   • prayers[] (Prayer[])
│               │   • journalEntries[] (JournalEntry[])
│               │   • tasbihSessions[] (TasbihSession[])
│               │
│               │   Actions:
│               │   • updatePrayerStatus()
│               │   • addJournalEntry()
│               │   • deleteJournalEntry()
│               │   • saveTasbihSession()
│               │   • getPrayerStreak()
│               │   • getTodayTasbihCount()
│               │
│               └── RootLayoutNav
│                   │
│                   ├── (onboarding) Stack
│                   │   └── welcome → features → stats → name → gender
│                   │       → age → motivation → lifestage → quote1
│                   │       → experience → commitment → quote2
│                   │       → location → calculation → notifications → ready
│                   │
│                   ├── (tabs) TabNavigator
│                   │   └── index | prayer | tasbih | tracker | journal
│                   │
│                   └── modal (Settings)
```

---

## 6. AsyncStorage Keys

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASYNC STORAGE SCHEMA                          │
└─────────────────────────────────────────────────────────────────┘

'noor_onboarding_complete'
└── 'true' | null

'noor_onboarding_data'
└── {
      userProfile: {                    ← NEW
        name: string,
        gender: 'male' | 'female' | 'prefer_not_to_say',
        ageRange: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+',
        motivations: Motivation[],
        lifeStage: LifeStage,
        islamicExperience: IslamicExperience,
        commitmentLevel: CommitmentLevel
      },
      location: { latitude, longitude, cityName, method },
      calculationMethod: string,
      notifications: { enabled, prayers[], reminderMinutes },
      completedAt: ISO timestamp
    }

'noor_prayers'
└── {
      date: 'YYYY-MM-DD',
      prayers: [{ id, name, nameArabic, status, time }, ...]
    }

'noor_journal'
└── [{ id, date, content, mood, createdAt, updatedAt }, ...]

'noor_tasbih'
└── [{ id, presetId, count, target, date, completed }, ...]
```

---

## 7. Component Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT STRUCTURE                           │
└─────────────────────────────────────────────────────────────────┘

app/
├── _layout.tsx ─────────────── Root layout (providers + routing)
├── modal.tsx ───────────────── Settings modal
│
├── (onboarding)/
│   ├── _layout.tsx ─────────── Stack navigator (slide animation)
│   │
│   │   ─── Phase 1: Welcome & Credibility ───
│   ├── welcome.tsx ─────────── Welcome screen (step 0)
│   ├── features.tsx ────────── App features showcase (step 1)    ← NEW
│   ├── stats.tsx ───────────── Credibility stats (step 2)        ← NEW
│   │
│   │   ─── Phase 2: User Profile ───
│   ├── name.tsx ────────────── Name input (step 3)               ← NEW
│   ├── gender.tsx ──────────── Gender selection (step 4)         ← NEW
│   ├── age.tsx ─────────────── Age range (step 5)                ← NEW
│   ├── motivation.tsx ──────── Motivations multi-select (step 6) ← NEW
│   ├── lifestage.tsx ───────── Life stage (step 7)               ← NEW
│   │
│   │   ─── Phase 3: Spiritual Journey ───
│   ├── quote1.tsx ──────────── Inspirational quote (step 8)      ← NEW
│   ├── experience.tsx ──────── Islamic experience (step 9)       ← NEW
│   ├── commitment.tsx ──────── Commitment level (step 10)        ← NEW
│   ├── quote2.tsx ──────────── Personalized quote (step 11)      ← NEW
│   │
│   │   ─── Phase 4: App Setup ───
│   ├── location.tsx ────────── Location setup (step 12)
│   ├── calculation.tsx ─────── Method selection (step 13)
│   ├── notifications.tsx ───── Notification config (step 14)
│   └── ready.tsx ───────────── Completion screen (step 15)
│
└── (tabs)/
    ├── _layout.tsx ─────────── Tab navigator
    ├── index.tsx ───────────── Home tab
    ├── prayer.tsx ──────────── Prayer times + Qibla
    ├── tasbih.tsx ──────────── Dhikr counter
    ├── tracker.tsx ─────────── Prayer status tracker
    └── journal.tsx ─────────── Reflection journal

components/
├── IslamicPattern.tsx ──────── Decorative separator
└── onboarding/
    ├── index.ts ────────────── Barrel export
    ├── FeatureItem.tsx ─────── Feature list item
    ├── OnboardingButton.tsx ── Styled button (primary/secondary/text)
    └── OnboardingProgress.tsx ─ Progress bar (for 16 steps)      ← UPDATED

providers/
├── OnboardingProvider.tsx ──── Onboarding + UserProfile state    ← UPDATED
└── AppProvider.tsx ─────────── App data state + persistence

types/
└── index.ts ────────────────── TypeScript interfaces
```

---

## 8. Data Types

```typescript
// User Profile Types (NEW)
type Gender = 'male' | 'female' | 'prefer_not_to_say';
type AgeRange = '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
type LifeStage = 'student' | 'early_career' | 'established_career' | 'parent' | 'retired' | 'other';
type IslamicExperience = 'new_to_islam' | 'growing' | 'practicing' | 'knowledgeable';
type CommitmentLevel = 'exploring' | 'building_habits' | 'consistent' | 'devoted';
type Motivation =
  | 'prayer_times' | 'quran_connection' | 'build_habits' | 'learn_more'
  | 'community' | 'spiritual_growth' | 'ramadan_prep' | 'new_muslim';

interface UserProfile {
  name: string;
  gender: Gender | null;
  ageRange: AgeRange | null;
  motivations: Motivation[];
  lifeStage: LifeStage | null;
  islamicExperience: IslamicExperience | null;
  commitmentLevel: CommitmentLevel | null;
}

// Prayer status enum
type PrayerStatus = 'pending' | 'on_time' | 'late' | 'missed';

// Prayer object
interface Prayer {
  id: string;
  name: string;
  nameArabic: string;
  status: PrayerStatus;
  time: string;
}

// Journal entry
interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: 'grateful' | 'peaceful' | 'reflective' | 'hopeful' | 'struggling';
  createdAt: string;
  updatedAt: string;
}

// Tasbih session
interface TasbihSession {
  id: string;
  presetId: string;
  count: number;
  target: number;
  date: string;
  completed: boolean;
}

// Location data
interface LocationData {
  latitude: number;
  longitude: number;
  cityName: string;
  method: 'auto' | 'manual';
}

// Onboarding data (UPDATED)
interface OnboardingData {
  userProfile: UserProfile;        // NEW
  location: LocationData | null;
  calculationMethod: string;
  notifications: {
    enabled: boolean;
    prayers: string[];
    reminderMinutes: number;
  };
  completedAt: string | null;
}
```

---

## 9. Screen Transitions Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                 ONBOARDING SCREEN TRANSITIONS                    │
└─────────────────────────────────────────────────────────────────┘

Step  Screen          Next Screen      Trigger
────  ──────────────  ───────────────  ─────────────────────────
0     welcome         features         "Get Started" button
1     features        stats            "Continue" button
2     stats           name             "Continue" button
3     name            gender           "Continue" or "Skip" button
4     gender          age              "Continue" button
5     age             motivation       "Continue" button
6     motivation      lifestage        "Continue" button
7     lifestage       quote1           "Continue" button
8     quote1          experience       "Continue" button
9     experience      commitment       "Continue" button
10    commitment      quote2           "Continue" button
11    quote2          location         "Let's Set Up Noor" button
12    location        calculation      "Continue" button
13    calculation     notifications    "Continue" button
14    notifications   ready            "Enable" or "Maybe Later"
15    ready           (tabs)           "Start My Journey" button
```

---

## Change Log

| Date | Change Description |
|------|-------------------|
| 2026-01-16 | Initial state machine diagram created |
| 2026-01-17 | Expanded onboarding from 5 to 16 screens |
| 2026-01-17 | Added user profile data collection (name, gender, age, etc.) |
| 2026-01-17 | Added credibility screens (features, stats) |
| 2026-01-17 | Added spiritual journey screens (experience, commitment) |
| 2026-01-17 | Added inspirational quote transitions (quote1, quote2) |
| 2026-01-17 | Updated OnboardingProvider with UserProfile type |
| 2026-01-17 | Updated OnboardingProgress to use progress bar for 16 steps |

---

*This diagram should be updated whenever changes are made to the app's navigation, state management, or component structure.*
