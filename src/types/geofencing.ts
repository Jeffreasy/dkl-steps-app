/**
 * Geofencing Types
 *
 * Types voor geofencing met background location tracking en event-based conditional tracking.
 * Gebruikt @turf/turf voor accurate distance calculations en polygon checks.
 */

/**
 * GeoJSON Position type - [longitude, latitude] of [longitude, latitude, elevation]
 */
export type Position = [number, number] | [number, number, number];

/**
 * GeoJSON Polygon Geometry
 */
export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Position[][];
}

/**
 * GeoJSON Feature voor Polygon
 */
export interface PolygonFeature {
  type: 'Feature';
  geometry: PolygonGeometry;
  properties?: Record<string, any>;
}

/**
 * Geofence type - cirkel of polygon
 */
export type GeofenceType = 'circle' | 'polygon';

/**
 * Geofence status
 */
export type GeofenceStatus = 'inside' | 'outside' | 'unknown';

/**
 * Circulair geofence gebied (eenvoudigste vorm)
 */
export interface CircleGeofence {
  type: 'circle';
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  identifier: string;
}

/**
 * Polygon geofence gebied (complexere vorm)
 * Gebruikt GeoJSON polygon format voor compatibility met @turf/turf
 */
export interface PolygonGeofence {
  type: 'polygon';
  coordinates: Position[][]; // Array of [longitude, latitude] pairs
  identifier: string;
  feature?: PolygonFeature; // GeoJSON feature voor turf.js
}

/**
 * Union type voor alle geofence types
 */
export type Geofence = CircleGeofence | PolygonGeofence;

/**
 * Backend geofence format (from API)
 */
export interface BackendGeofence {
  type: 'start' | 'checkpoint' | 'finish';
  lat: number;
  long: number;
  radius: number;
  name?: string;
}

/**
 * Event config from backend
 */
export interface EventConfig {
  minStepsInterval?: number;
  requireGeofenceCheckin?: boolean;
  distanceThreshold?: number;
  accuracyLevel?: 'high' | 'balanced' | 'low';
  maxParticipants?: number;
  autoStart?: boolean;
}

/**
 * Event data from backend (matches API response)
 */
export interface EventData {
  id: string;
  name: string;
  description?: string;
  start_time: string; // ISO date string from backend
  end_time?: string; // ISO date string from backend
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  geofences: BackendGeofence[]; // Array of geofences from backend
  event_config?: EventConfig;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Computed properties for frontend use
 */
export interface EventDataEnhanced extends EventData {
  isActive: boolean; // Computed: tussen start_time en end_time
  primaryGeofence: CircleGeofence | null; // Converted first geofence
  allGeofences: CircleGeofence[]; // All geofences converted
}

/**
 * Geofence state in de app
 */
export interface GeofenceState {
  status: GeofenceStatus;
  currentEvent: EventData | null;
  lastChecked: Date | null;
  isMonitoring: boolean;
  distance?: number; // Distance to geofence center/edge in meters
}

/**
 * Background task data - wat wordt doorgegeven aan de background task
 */
export interface BackgroundLocationTaskData {
  eventId: string | null;
  geofences: BackendGeofence[];
  timestamp: number;
}

/**
 * Background location update event
 */
export interface BackgroundLocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Geofence transition event (enter/exit)
 */
export type GeofenceTransition = 'enter' | 'exit';

export interface GeofenceTransitionEvent {
  transition: GeofenceTransition;
  geofence: Geofence;
  location: BackgroundLocationUpdate;
  timestamp: number;
}

/**
 * Geofencing configuration
 */
export interface GeofencingConfig {
  /**
   * Minimum tijd tussen location updates (in ms)
   * Default: 30000 (30 seconden)
   */
  distanceInterval?: number;
  
  /**
   * Accuracy threshold (in meters)
   * Default: 50
   */
  accuracy?: number;
  
  /**
   * Enable background location tracking
   * Default: true
   */
  enableBackground?: boolean;
  
  /**
   * Show notification tijdens background tracking
   * Default: true (vereist voor Android 8+)
   */
  showBackgroundNotification?: boolean;
}

/**
 * Helper: Convert backend geofence to CircleGeofence
 */
export function convertBackendGeofence(bg: BackendGeofence): CircleGeofence {
  return {
    type: 'circle',
    center: {
      latitude: bg.lat,
      longitude: bg.long,
    },
    radius: bg.radius,
    identifier: `${bg.type}-${bg.name || 'unnamed'}`,
  };
}

/**
 * Helper: Check if event is currently active (tussen start_time en end_time)
 */
export function isEventCurrentlyActive(event: EventData): boolean {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;
  
  // Active als nu >= start EN (geen end OF nu <= end)
  return now >= start && (!end || now <= end);
}

/**
 * Helper: Get primary geofence (start of eerste checkpoint)
 */
export function getPrimaryGeofence(event: EventData): CircleGeofence | null {
  // Prioriteit: start > checkpoint > finish
  const startFence = event.geofences.find(g => g.type === 'start');
  if (startFence) return convertBackendGeofence(startFence);
  
  const checkpointFence = event.geofences.find(g => g.type === 'checkpoint');
  if (checkpointFence) return convertBackendGeofence(checkpointFence);
  
  const finishFence = event.geofences.find(g => g.type === 'finish');
  if (finishFence) return convertBackendGeofence(finishFence);
  
  return null;
}

/**
 * Conditional tracking state
 */
export interface ConditionalTrackingState {
  /**
   * Is tracking actief (binnen fence + event actief)
   */
  isTrackingEnabled: boolean;
  
  /**
   * Reden waarom tracking niet actief is (debugging)
   */
  disabledReason?: 'no_event' | 'outside_fence' | 'event_not_active' | 'permission_denied';
  
  /**
   * Laatste status update
   */
  lastUpdate: Date | null;
}