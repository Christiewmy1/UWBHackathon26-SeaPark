// filepath: mobile/src/constants/index.ts
/**
 * SeaPark Constants
 * ==================
 * 
 * Shared constants for the SeaPark application.
 * These values are used across the app and should match Figma design tokens.
 * 
 * Figma Reference:
 * These constants correspond to design tokens in the Figma file.
 * Color palette, typography, spacing, etc.
 */

// ============================================================================
// Color Palette (from Figma)
// ============================================================================

export const COLORS = {
  // Primary Colors
  primary: '#10B981',        // Emerald Green - Main brand color
  primaryLight: '#34D399',   // Light emerald for hover states
  primaryDark: '#059669',   // Dark emerald for pressed states
  
  // Secondary Colors
  secondary: '#9CA3AF',     // Space Needle Silver - Secondary elements
  secondaryLight: '#D1D5DB',
  secondaryDark: '#6B7280',
  
  // Background Colors
  background: '#1E3A5F',     // Deep Puget Blue - Main background
  backgroundLight: '#F9FAFB',
  backgroundDark: '#111827',
  
  // Availability Colors
  availability: {
    high: '#10B981',        // Green - High availability
    limited: '#F59E0B',     // Amber/Yellow - Limited availability
    full: '#EF4444',       // Red - Full/Congested
  },
  
  // Text Colors
  text: {
    primary: '#1F2937',     // Primary text
    secondary: '#6B7280',   // Secondary text
    light: '#9CA3AF',       // Light/placeholder text
    inverse: '#FFFFFF',    // Text on dark backgrounds
  },
  
  // UI Colors
  ui: {
    border: '#E5E7EB',      // Border color
    divider: '#F3F4F6',     // Divider color
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    card: '#FFFFFF',       // Card background
    input: '#F9FAFB',      // Input background
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

// ============================================================================
// Typography (from Figma)
// ============================================================================

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    primary: 'Inter',      // Clean sans-serif
    secondary: 'Roboto',   // Alternative sans-serif
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// Spacing (from Figma)
// ============================================================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ============================================================================
// Border Radius (from Figma)
// ============================================================================

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ============================================================================
// Shadows (from Figma)
// ============================================================================

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// Map Configuration
// ============================================================================

export const MAP_CONFIG = {
  // Seattle Center
  seattleCenter: {
    latitude: 47.6062,
    longitude: -122.3321,
  },
  
  // Default Map Region
  defaultRegion: {
    latitude: 47.6062,
    longitude: -122.3321,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // Zoom Levels
  zoom: {
    min: 10,
    max: 20,
    default: 14,
  },
  
  // Heatmap Settings
  heatmap: {
    radius: 30,
    opacity: 0.7,
    gradient: {
      colors: ['#10B981', '#F59E0B', '#EF4444'],
      startPoints: [0, 0.5, 1],
    },
  },
  
  // Marker Settings
  marker: {
    size: 40,
    iconSize: 24,
  },
} as const;

// ============================================================================
// API Configuration
// ============================================================================

// Detect the backend URL automatically from Expo's dev-server host.
// Expo Go already knows the machine's LAN IP — we just swap the port.
function _detectBackendUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default;
    const hostUri: string =
      Constants?.expoConfig?.hostUri ??
      Constants?.manifest2?.extra?.expoClient?.hostUri ??
      Constants?.manifest?.debuggerHost ?? '';
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      return `http://${host}:8000`;
    }
  } catch {
    // expo-constants unavailable
  }
  return 'http://localhost:8000';
}

export const API_CONFIG = {
  baseUrl: _detectBackendUrl(),
  
  // API Version
  version: 'v1',
  
  // Endpoints
  endpoints: {
    parking: {
      lots: '/api/v1/parking/lots',
      search: '/api/v1/parking/search',
      heatmap: '/api/v1/parking/heatmap',
    },
    reports: '/api/v1/reports',
    ai: '/api/v1/ai/query',
    users: '/api/v1/users',
    seattle: {
      holidays: '/api/v1/seattle/holidays',
      rpz: '/api/v1/seattle/rpz',
      events: '/api/v1/seattle/events',
    },
  },
  
  // Timeouts
  timeout: {
    default: 10000,    // 10 seconds
    long: 30000,        // 30 seconds
  },
  
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    delay: 1000,       // 1 second
  },
} as const;

// ============================================================================
// Firebase Configuration
// ============================================================================

export const FIREBASE_CONFIG = {
  // TODO: Replace with actual Firebase config
  apiKey: 'YOUR_API_KEY',
  authDomain: 'seapark-app.firebaseapp.com',
  projectId: 'seapark-app',
  storageBucket: 'seapark-app.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
  
  // Collections
  collections: {
    parkingLots: 'parking_lots',
    reports: 'reports',
    ratings: 'ratings',
    users: 'users',
    userHistory: 'user_history',
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  // Enable/Disable features
  aiAssistant: true,
  heatmapOverlay: true,
  freeOnlyToggle: true,
  userRatings: true,
  favorites: true,
  history: true,
  eventIntegration: true,
  rpzAwareness: true,
  
  // Feature toggles for development
  development: {
    showDebugInfo: false,
    mockData: false,
    logApiCalls: true,
  },
} as const;

// ============================================================================
// Seattle-Specific Constants
// ============================================================================

export const SEATTLE = {
  // Center coordinates
  center: {
    latitude: 47.6062,
    longitude: -122.3321,
  },
  
  // Popular destinations
  destinations: {
    pikePlace: { latitude: 47.6097, longitude: -122.3421, name: 'Pike Place Market' },
    spaceNeedle: { latitude: 47.6205, longitude: -122.3493, name: 'Space Needle' },
    downtown: { latitude: 47.6062, longitude: -122.3321, name: 'Downtown Seattle' },
    capHill: { latitude: 47.6253, longitude: -122.3222, name: 'Capitol Hill' },
    belltown: { latitude: 47.6163, longitude: -122.3436, name: 'Belltown' },
    slu: { latitude: 47.6282, longitude: -122.3465, name: 'South Lake Union' },
  },
  
  // Event venues
  venues: {
    climatePledge: { latitude: 47.5642, longitude: -122.3321, name: 'Climate Pledge Arena' },
    tMobilePark: { latitude: 47.5917, longitude: -122.3326, name: 'T-Mobile Park' },
    lumenField: { latitude: 47.5952, longitude: -122.3316, name: 'Lumen Field' },
  },
  
  // Free parking days
  freeParkingDays: [0],  // Sunday (0 in JavaScript Date)
  
  // Holidays with free parking
  holidays: [
    'New Year\'s Day',
    'MLK Jr. Day',
    'Presidents Day',
    'Memorial Day',
    'Independence Day',
    'Labor Day',
    'Thanksgiving',
    'Christmas Day',
  ],
} as const;

// ============================================================================
// UI Component Sizes
// ============================================================================

export const COMPONENT_SIZES = {
  // Button sizes
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 56,
    },
    padding: {
      sm: 12,
      md: 16,
      lg: 20,
    },
  },
  
  // Input sizes
  input: {
    height: 48,
    padding: 16,
  },
  
  // Card sizes
  card: {
    padding: 16,
    borderRadius: 12,
  },
  
  // FAB size
  fab: {
    size: 56,
    iconSize: 28,
  },
  
  // Bottom sheet
  bottomSheet: {
    handleHeight: 4,
    handleWidth: 40,
    borderRadius: 24,
  },
} as const;

// ============================================================================
// Animation Durations
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easing curves
  easing: {
    standard: 'ease-in-out',
    enter: 'ease-out',
    exit: 'ease-in',
  },
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  // Rating bounds
  rating: {
    min: 0,
    max: 10,
  },
  
  // Price bounds
  price: {
    min: 0,
    max: 100,
  },
  
  // Search radius bounds
  radius: {
    min: 0.1,   // km
    max: 10,    // km
  },
  
  // Report cooldown (seconds)
  reportCooldown: 300,  // 5 minutes
} as const;

// ============================================================================
// Export all constants
// ============================================================================

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  MAP_CONFIG,
  API_CONFIG,
  FIREBASE_CONFIG,
  FEATURES,
  SEATTLE,
  COMPONENT_SIZES,
  ANIMATION,
  VALIDATION,
};