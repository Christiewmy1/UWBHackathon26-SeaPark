// filepath: mobile/src/types/index.ts
/**
 * SeaPark TypeScript Types
 * =========================
 * 
 * Shared type definitions for the SeaPark application.
 * These types ensure consistency between frontend and backend.
 * 
 * Figma Integration:
 * These types correspond to the design components in Figma.
 * Each screen and component in Figma should map to these types.
 * 
 * Team Assignment: All developers should reference these types
 * Time Estimate: 1 hour to review and understand
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Parking Lot / Spot
 * Represents a parking location in Seattle
 */
export interface ParkingLot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isFree: boolean;
  pricePerHour: number;
  timeLimit: string | null;
  address: string | null;
  zoneType: ZoneType;
  availability: Availability;
  safeScore: number;
  cleanScore: number;
  spaceScore: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Zone types for parking locations
 */
export type ZoneType = 'street' | 'garage' | 'lot' | 'metered';

/**
 * Availability status for parking
 */
export type Availability = 'high' | 'limited' | 'full';

/**
 * User parking report
 */
export interface ParkingReport {
  id: string;
  lotId: string;
  userId: string;
  reportType: ReportType;
  latitude: number;
  longitude: number;
  timestamp: string;
}

/**
 * Types of parking reports
 */
export type ReportType = 'parked' | 'leaving' | 'full';

/**
 * User rating for a parking spot
 */
export interface ParkingRating {
  id: string;
  lotId: string;
  userId: string;
  safeScore: number;
  cleanScore: number;
  spaceScore: number;
  comment: string | null;
  createdAt: string;
}

/**
 * User profile
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  favorites: string[];
  createdAt: string;
}

/**
 * User parking history entry
 */
export interface HistoryEntry {
  id: string;
  userId: string;
  lotId: string;
  action: HistoryAction;
  timestamp: string;
}

/**
 * History action types
 */
export type HistoryAction = 'parked' | 'searched' | 'favorited';

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Parking lot creation request
 */
export interface CreateParkingLotRequest {
  name: string;
  latitude: number;
  longitude: number;
  isFree: boolean;
  pricePerHour?: number;
  timeLimit?: string;
  address?: string;
  zoneType: ZoneType;
}

/**
 * Parking lot update request
 */
export interface UpdateParkingLotRequest {
  name?: string;
  latitude?: number;
  longitude?: number;
  isFree?: boolean;
  pricePerHour?: number;
  timeLimit?: string;
  address?: string;
  zoneType?: ZoneType;
  availability?: Availability;
  safeScore?: number;
  cleanScore?: number;
  spaceScore?: number;
}

/**
 * Report creation request
 */
export interface CreateReportRequest {
  lotId: string;
  userId: string;
  reportType: ReportType;
  latitude: number;
  longitude: number;
}

/**
 * Rating creation request
 */
export interface CreateRatingRequest {
  lotId: string;
  userId: string;
  safeScore: number;
  cleanScore: number;
  spaceScore: number;
  comment?: string;
}

/**
 * Search request
 */
export interface SearchRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

/**
 * Search response
 */
export interface SearchResponse {
  results: ParkingLot[];
  query: string;
}

// ============================================================================
// AI Types
// ============================================================================

/**
 * Husky AI query request
 */
export interface AIQueryRequest {
  query: string;
  userId?: string;
  location?: GeoLocation;
}

/**
 * Husky AI query response
 */
export interface AIQueryResponse {
  response: string;
  suggestedLocations?: ParkingLot[];
  confidence: number;
}

/**
 * Geographic location
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// ============================================================================
// Seattle-Specific Types
// ============================================================================

/**
 * Seattle holiday information
 */
export interface HolidayInfo {
  isFreeDay: boolean;
  nextFreeDay: string;
  holidays: Holiday[];
}

/**
 * Holiday definition
 */
export interface Holiday {
  name: string;
  date: string;
  isFreeParking: boolean;
}

/**
 * Restricted Parking Zone (RPZ)
 */
export interface RPZZone {
  id: string;
  name: string;
  boundaries: GeoLocation[];
  restrictions: string;
  permitRequired: boolean;
}

/**
 * Event parking info
 */
export interface EventInfo {
  id: string;
  name: string;
  venue: string;
  date: string;
  type: EventType;
  suggestedParking: ParkingLot[];
  transitOptions: string[];
}

/**
 * Event types
 */
export type EventType = 'kraken' | 'mariners' | 'concert' | 'other';

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Map region
 */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Heatmap point for visualization
 */
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

/**
 * Filter options for parking search
 */
export interface ParkingFilters {
  freeOnly: boolean;
  zoneType?: ZoneType;
  maxPrice?: number;
  minSafeScore?: number;
  maxDistance?: number;
}

/**
 * Sort options for parking results
 */
export type SortOption = 'distance' | 'price' | 'availability' | 'rating';

/**
 * Report modal state
 */
export interface ReportModalState {
  visible: boolean;
  selectedLot: ParkingLot | null;
  reportType: ReportType | null;
}

/**
 * Spot details card state
 */
export interface SpotCardState {
  visible: boolean;
  lot: ParkingLot | null;
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Navigation stack parameters
 */
export type RootStackParamList = {
  Map: undefined;
  SpotDetails: { lotId: string };
  AIConcierge: undefined;
  Settings: undefined;
  Favorites: undefined;
  History: undefined;
};

/**
 * Screen names
 */
export type ScreenName = keyof RootStackParamList;

// ============================================================================
// Constants (re-exported from constants file)
// ============================================================================

export const COLORS = {
  primary: '#10B981',      // Emerald Green
  secondary: '#6B7280',    // Space Needle Silver
  background: '#1E3A5F',   // Deep Puget Blue
  success: '#10B981',      // Green (high availability)
  warning: '#F59E0B',      // Amber (limited availability)
  danger: '#EF4444',       // Red (full)
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  background: {
    light: '#F9FAFB',
    dark: '#1F2937',
  },
} as const;

export const SEATTLE_CENTER = {
  latitude: 47.6062,
  longitude: -122.3321,
} as const;

export const DEFAULT_MAP_DELTA = 0.05;