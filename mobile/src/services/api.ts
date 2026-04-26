// filepath: mobile/src/services/api.ts
/**
 * SeaPark API Service
 * ====================
 * 
 * Frontend service for communicating with the SeaPark backend API.
 * All API calls should go through this service.
 * 
 * CORS Configuration:
 * The backend is configured to accept requests from:
 * - http://localhost:3000
 * - http://localhost:8081
 * - exp://localhost:8081
 * 
 * CRUD Architecture:
 * - Create: POST endpoints
 * - Read: GET endpoints
 * - Update: PUT endpoints
 * - Delete: DELETE endpoints
 * 
 * Team Assignment: 1 developer
 * Time Estimate: 2-3 hours
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, FEATURES } from '../constants';
import type {
  ParkingLot,
  ParkingReport,
  CreateReportRequest,
  SearchResponse,
  AIQueryRequest,
  AIQueryResponse,
  HolidayInfo,
  RPZZone,
  EventInfo,
} from '../types';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout.default,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (FEATURES.development.logApiCalls) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('[API] Response error:', error.response?.data);
    return Promise.reject(error);
  }
);

// ============================================================================
// Parking Lots CRUD Operations
// ============================================================================

/**
 * Get all parking lots with optional filters
 * READ operation
 */
export const getParkingLots = async (
  freeOnly: boolean = false,
  zoneType?: string,
  limit: number = 100
): Promise<ParkingLot[]> => {
  const response = await api.get(API_CONFIG.endpoints.parking.lots, {
    params: { free_only: freeOnly, zone_type: zoneType, limit },
  });
  return response.data;
};

/**
 * Get a single parking lot by ID
 * READ operation
 */
export const getParkingLot = async (lotId: string): Promise<ParkingLot> => {
  const response = await api.get(`${API_CONFIG.endpoints.parking.lots}/${lotId}`);
  return response.data;
};

/**
 * Create a new parking lot (admin only)
 * CREATE operation
 */
export const createParkingLot = async (lotData: Partial<ParkingLot>): Promise<ParkingLot> => {
  const response = await api.post(API_CONFIG.endpoints.parking.lots, lotData);
  return response.data;
};

/**
 * Update an existing parking lot
 * UPDATE operation
 */
export const updateParkingLot = async (
  lotId: string,
  lotData: Partial<ParkingLot>
): Promise<ParkingLot> => {
  const response = await api.put(`${API_CONFIG.endpoints.parking.lots}/${lotId}`, lotData);
  return response.data;
};

/**
 * Delete a parking lot (admin only)
 * DELETE operation
 */
export const deleteParkingLot = async (lotId: string): Promise<void> => {
  await api.delete(`${API_CONFIG.endpoints.parking.lots}/${lotId}`);
};

// ============================================================================
// Search & Heatmap
// ============================================================================

/**
 * Search for parking spots
 */
export const searchParking = async (
  query: string,
  latitude?: number,
  longitude?: number,
  radius: number = 1
): Promise<SearchResponse> => {
  const response = await api.get(API_CONFIG.endpoints.parking.search, {
    params: { query, latitude, longitude, radius },
  });
  return response.data;
};

/**
 * Get heatmap data for parking density visualization
 */
export const getHeatmapData = async (
  latitude: number = 47.6062,
  longitude: number = -122.3321,
  radius: number = 5
): Promise<{ points: Array<{ latitude: number; longitude: number; weight: number }> }> => {
  const response = await api.get(API_CONFIG.endpoints.parking.heatmap, {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

// ============================================================================
// Reports (CRUD)
// ============================================================================

/**
 * Submit a parking status report
 * CREATE operation
 */
export const submitReport = async (report: CreateReportRequest): Promise<ParkingReport> => {
  const response = await api.post(API_CONFIG.endpoints.reports, report);
  return response.data;
};

/**
 * Get recent parking reports
 * READ operation
 */
export const getReports = async (
  lotId?: string,
  limit: number = 50
): Promise<{ reports: ParkingReport[] }> => {
  const response = await api.get(API_CONFIG.endpoints.reports, {
    params: { lot_id: lotId, limit },
  });
  return response.data;
};

// ============================================================================
// Husky AI
// ============================================================================

/**
 * Query Husky AI assistant
 */
export const queryHuskyAI = async (
  query: string,
  userId?: string,
  location?: { latitude: number; longitude: number }
): Promise<AIQueryResponse> => {
  const response = await api.post(API_CONFIG.endpoints.ai, {
    query,
    user_id: userId,
    location,
  });
  return response.data;
};

// ============================================================================
// User Preferences
// ============================================================================

/**
 * Get user's favorite parking locations
 * READ operation
 */
export const getUserFavorites = async (userId: string): Promise<{ favorites: string[] }> => {
  const response = await api.get(`${API_CONFIG.endpoints.users}/${userId}/favorites`);
  return response.data;
};

/**
 * Add a parking lot to user's favorites
 * CREATE operation
 */
export const addUserFavorite = async (
  userId: string,
  lotId: string
): Promise<{ message: string }> => {
  const response = await api.post(`${API_CONFIG.endpoints.users}/${userId}/favorites`, {
    lot_id: lotId,
  });
  return response.data;
};

/**
 * Remove a parking lot from user's favorites
 * DELETE operation
 */
export const removeUserFavorite = async (
  userId: string,
  lotId: string
): Promise<{ message: string }> => {
  const response = await api.delete(
    `${API_CONFIG.endpoints.users}/${userId}/favorites/${lotId}`
  );
  return response.data;
};

/**
 * Get user's parking history
 * READ operation
 */
export const getUserHistory = async (
  userId: string,
  limit: number = 20
): Promise<{ history: any[] }> => {
  const response = await api.get(`${API_CONFIG.endpoints.users}/${userId}/history`, {
    params: { limit },
  });
  return response.data;
};

// ============================================================================
// Seattle-Specific Features
// ============================================================================

/**
 * Get Seattle holiday schedule for free parking rules
 */
export const getHolidaySchedule = async (): Promise<HolidayInfo> => {
  const response = await api.get(API_CONFIG.endpoints.seattle.holidays);
  return response.data;
};

/**
 * Get Restricted Parking Zones (RPZ) near a location
 */
export const getRPZZones = async (
  latitude: number,
  longitude: number,
  radius: number = 1
): Promise<{ rpz_zones: RPZZone[] }> => {
  const response = await api.get(API_CONFIG.endpoints.seattle.rpz, {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

/**
 * Get parking suggestions for events
 */
export const getEventParking = async (
  eventType?: string,
  date?: string
): Promise<{ events: EventInfo[]; suggestions: any[] }> => {
  const response = await api.get(API_CONFIG.endpoints.seattle.events, {
    params: { event_type: eventType, date },
  });
  return response.data;
};

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check API health status
 */
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/api/v1/health');
  return response.data;
};

// ============================================================================
// Export
// ============================================================================

export default {
  // Parking Lots
  getParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  
  // Search & Heatmap
  searchParking,
  getHeatmapData,
  
  // Reports
  submitReport,
  getReports,
  
  // AI
  queryHuskyAI,
  
  // User
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
  getUserHistory,
  
  // Seattle
  getHolidaySchedule,
  getRPZZones,
  getEventParking,
  
  // Health
  checkApiHealth,
};