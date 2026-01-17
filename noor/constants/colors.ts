/**
 * Noor Design System - "Celestial Sanctuary"
 *
 * A refined, luxurious Islamic aesthetic evoking sacred spaces
 * under star-filled desert skies. Rich midnight blues, luminous
 * amber-gold, and soft parchment tones create a spiritually
 * resonant experience.
 */

const palette = {
  // Primary - Deep Emerald (Islamic heritage)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Accent - Luminous Gold/Amber
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Neutrals - Warm Parchment Scale
  sand: {
    50: '#FDFCF9',
    100: '#FAF8F3',
    200: '#F5F0E6',
    300: '#E8E0D0',
    400: '#D4C9B5',
    500: '#B8A990',
    600: '#9A8B70',
    700: '#7A6D55',
    800: '#5C523F',
    900: '#3D362A',
    950: '#1F1B15',
  },

  // Midnight - Deep Blues for Dark Surfaces
  midnight: {
    50: '#F0F4FF',
    100: '#E0E8FF',
    200: '#C7D4FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#1E293B',
    800: '#0F172A',
    900: '#0A1020',
    950: '#050810',
  },

  // Status Colors
  status: {
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#B91C1C',
    errorLight: '#FEE2E2',
    info: '#0284C7',
    infoLight: '#E0F2FE',
  },
};

export default {
  light: {
    // Primary Brand Colors
    primary: '#047857',           // Deep emerald - sacred, grounding
    primaryLight: '#059669',      // Lighter emerald for accents
    primaryDark: '#022C22',       // Nearly black emerald for depth
    primaryMuted: '#065F46',      // Muted for secondary elements

    // Gold Accent (the soul of the design)
    gold: '#D97706',              // Rich amber gold
    goldLight: '#F59E0B',         // Luminous gold for highlights
    goldSoft: '#FDE68A',          // Soft gold for subtle accents
    goldMuted: '#FEF3C7',         // Whisper of gold for backgrounds

    // Surface Colors
    background: '#FAF8F3',        // Warm parchment
    surface: '#FDFCF9',           // Clean ivory surface
    surfaceElevated: '#FFFFFF',   // Pure white for elevated cards
    surfaceSubdued: '#F5F0E6',    // Subtle depth for sections

    // Text Hierarchy
    text: '#1F1B15',              // Rich dark brown - readable, warm
    textSecondary: '#5C523F',     // Muted earth tone
    textMuted: '#9A8B70',         // Soft stone color
    textOnPrimary: '#FDFCF9',     // Light text on dark backgrounds
    textGold: '#92400E',          // Gold-toned text for accents

    // Borders & Dividers
    border: '#E8E0D0',            // Warm neutral border
    borderLight: '#F5F0E6',       // Very subtle border
    borderAccent: '#D97706',      // Gold accent border

    // Status
    success: palette.status.success,
    successBg: palette.status.successLight,
    warning: palette.status.warning,
    warningBg: palette.status.warningLight,
    missed: '#B91C1C',
    missedBg: '#FEE2E2',
    info: palette.status.info,
    infoBg: palette.status.infoLight,

    // Legacy Compatibility
    cream: '#FAF8F3',
    ivory: '#FDFCF9',
    tint: '#047857',
    tabIconDefault: '#B8A990',
    tabIconSelected: '#047857',

    // Gradient Stops
    gradients: {
      primary: ['#022C22', '#047857', '#FAF8F3'],
      gold: ['#92400E', '#D97706', '#F59E0B'],
      sunset: ['#1F1B15', '#92400E', '#D97706'],
      night: ['#0A1020', '#1E293B', '#0F172A'],
    },
  },

  dark: {
    // Primary Brand Colors
    primary: '#10B981',           // Luminous emerald
    primaryLight: '#34D399',      // Bright emerald glow
    primaryDark: '#064E3B',       // Deep forest
    primaryMuted: '#047857',      // Balanced emerald

    // Gold Accent
    gold: '#F59E0B',              // Bright luminous gold
    goldLight: '#FBBF24',         // Glowing gold
    goldSoft: '#FDE68A',          // Soft highlight
    goldMuted: '#78350F',         // Muted gold for backgrounds

    // Surface Colors (Deep Midnight)
    background: '#0A1020',        // Deep space midnight
    surface: '#0F172A',           // Rich midnight blue
    surfaceElevated: '#1E293B',   // Elevated slate
    surfaceSubdued: '#1E293B',    // Subtle depth

    // Text Hierarchy
    text: '#FAF8F3',              // Warm white
    textSecondary: '#D4C9B5',     // Soft sand
    textMuted: '#9A8B70',         // Muted warm
    textOnPrimary: '#0A1020',     // Dark text on light
    textGold: '#FDE68A',          // Golden accent text

    // Borders & Dividers
    border: '#3D362A',            // Warm dark border
    borderLight: '#1E293B',       // Subtle border
    borderAccent: '#F59E0B',      // Gold accent

    // Status
    success: '#10B981',
    successBg: '#064E3B',
    warning: '#F59E0B',
    warningBg: '#78350F',
    missed: '#EF4444',
    missedBg: '#7F1D1D',
    info: '#38BDF8',
    infoBg: '#0C4A6E',

    // Legacy Compatibility
    cream: '#0A1020',
    ivory: '#0F172A',
    tint: '#F59E0B',
    tabIconDefault: '#5C523F',
    tabIconSelected: '#F59E0B',

    // Gradient Stops
    gradients: {
      primary: ['#0A1020', '#064E3B', '#047857'],
      gold: ['#451A03', '#78350F', '#D97706'],
      sunset: ['#0A1020', '#451A03', '#92400E'],
      night: ['#050810', '#0A1020', '#1E293B'],
    },
  },
};

// Typography Scale
export const typography = {
  // Display - For hero text and major headings
  display: {
    large: {
      fontSize: 56,
      lineHeight: 64,
      fontWeight: '300' as const,
      letterSpacing: -1.5,
    },
    medium: {
      fontSize: 44,
      lineHeight: 52,
      fontWeight: '300' as const,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },

  // Headings
  heading: {
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as const,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },

  // Body Text
  body: {
    large: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
    },
  },

  // Labels & Captions
  label: {
    large: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
  },

  // Arabic Text
  arabic: {
    display: {
      fontSize: 32,
      lineHeight: 56,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    large: {
      fontSize: 28,
      lineHeight: 48,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 22,
      lineHeight: 36,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },
};

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border Radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows (iOS)
export const shadows = {
  sm: {
    shadowColor: '#1F1B15',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1F1B15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1F1B15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#1F1B15',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
  gold: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  inner: {
    shadowColor: '#1F1B15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
};

// Animation Durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  stagger: 100,
};
