/**
 * useGeofencing Hook
 * 
 * Geofencing met background location tracking via TaskManager.
 * Gebruikt @turf/turf voor accurate afstand berekeningen (Haversine) en polygon checks.
 * 
 * Features:
 * - Background enter/exit events via TaskManager
 * - Circulaire geofences (Haversine distance)
 * - Polygon geofences (point-in-polygon)
 * - Automatic permission handling
 * - Status tracking (inside/outside/unknown)
 * 
 * @example
 * ```typescript
 * const {
 *   status,
 *   isMonitoring,
 *   distance,
 *   startMonitoring,
 *   stopMonitoring,
 * } = useGeofencing({
 *   geofence: eventLocation.geofence,
 *   onEnter: () => console.log('Entered geofence!'),
 *   onExit: () => console.log('Left geofence!'),
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { distance as turfDistance } from '@turf/turf';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type {
  Geofence,
  GeofenceState,
  GeofenceStatus,
  GeofenceTransition,
  GeofencingConfig,
  BackgroundLocationUpdate,
} from '../types/geofencing';
import { logger } from '../utils/logger';
import { haptics } from '../utils/haptics';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Default configuration
const DEFAULT_CONFIG: Required<GeofencingConfig> = {
  distanceInterval: 30000, // 30 seconden
  accuracy: Location.Accuracy.Balanced,
  enableBackground: true,
  showBackgroundNotification: true,
};

interface UseGeofencingOptions {
  geofence: Geofence | null;
  onEnter?: (location: BackgroundLocationUpdate) => void;
  onExit?: (location: BackgroundLocationUpdate) => void;
  config?: GeofencingConfig;
}

interface UseGeofencingReturn extends GeofenceState {
  startMonitoring: () => Promise<boolean>;
  stopMonitoring: () => Promise<void>;
  checkStatus: () => Promise<GeofenceStatus>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Calculate distance to geofence center (voor circles) of nearest edge (voor polygons)
 * Gebruikt Haversine formula via @turf/distance
 */
function calculateDistance(
  currentLat: number,
  currentLon: number,
  geofence: Geofence
): number {
  const currentPoint = turfPoint([currentLon, currentLat]);

  if (geofence.type === 'circle') {
    // Haversine distance to circle center
    const centerPoint = turfPoint([
      geofence.center.longitude,
      geofence.center.latitude,
    ]);
    const distanceKm = turfDistance(currentPoint, centerPoint, { units: 'kilometers' });
    return distanceKm * 1000; // Convert to meters
  } else {
    // Voor polygons: distance to nearest edge
    // Simplified: distance to first vertex (voor complete implementatie zou je alle vertices moeten checken)
    if (geofence.coordinates[0]?.length > 0) {
      const firstVertex = geofence.coordinates[0][0];
      const vertexPoint = turfPoint(firstVertex);
      const distanceKm = turfDistance(currentPoint, vertexPoint, { units: 'kilometers' });
      return distanceKm * 1000;
    }
    return 0;
  }
}

/**
 * Check if current location is inside geofence
 */
function isInsideGeofence(
  currentLat: number,
  currentLon: number,
  geofence: Geofence
): boolean {
  if (geofence.type === 'circle') {
    // Circle check: distance < radius
    const distance = calculateDistance(currentLat, currentLon, geofence);
    return distance <= geofence.radius;
  } else {
    // Polygon check: point-in-polygon
    const point = turfPoint([currentLon, currentLat]);
    const poly = turfPolygon(geofence.coordinates);
    return booleanPointInPolygon(point, poly);
  }
}

export function useGeofencing({
  geofence,
  onEnter,
  onExit,
  config = {},
}: UseGeofencingOptions): UseGeofencingReturn {
  const [state, setState] = useState<GeofenceState>({
    status: 'unknown',
    currentEvent: null,
    lastChecked: null,
    isMonitoring: false,
    distance: undefined,
  });

  const [hasPermission, setHasPermission] = useState(false);
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const lastStatusRef = useRef<GeofenceStatus>('unknown');
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /**
   * Request location permissions (foreground + background)
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Request foreground permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        logger.warn('Foreground location permission denied');
        return false;
      }

      // Request background permission (als enabled in config)
      if (mergedConfig.enableBackground) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          logger.warn('Background location permission denied');
          // Still allow foreground tracking
        }
      }

      setHasPermission(true);
      return true;
    } catch (error) {
      logger.error('Permission request failed:', error);
      return false;
    }
  }, [mergedConfig.enableBackground]);

  /**
   * Check current geofence status
   */
  const checkStatus = useCallback(async (): Promise<GeofenceStatus> => {
    if (!geofence) return 'unknown';

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: mergedConfig.accuracy,
      });

      const { latitude, longitude } = location.coords;
      const inside = isInsideGeofence(latitude, longitude, geofence);
      const distance = calculateDistance(latitude, longitude, geofence);

      const newStatus: GeofenceStatus = inside ? 'inside' : 'outside';

      setState(prev => ({
        ...prev,
        status: newStatus,
        distance,
        lastChecked: new Date(),
      }));

      // Detect transition
      if (lastStatusRef.current !== newStatus) {
        const transition: GeofenceTransition = newStatus === 'inside' ? 'enter' : 'exit';
        logger.info(`Geofence transition: ${transition}`, { distance });

        // Trigger callbacks
        if (transition === 'enter' && onEnter) {
          await haptics.success();
          onEnter({
            latitude,
            longitude,
            accuracy: location.coords.accuracy ?? undefined,
            timestamp: location.timestamp,
          });
        } else if (transition === 'exit' && onExit) {
          await haptics.warning();
          onExit({
            latitude,
            longitude,
            accuracy: location.coords.accuracy ?? undefined,
            timestamp: location.timestamp,
          });
        }

        lastStatusRef.current = newStatus;
      }

      return newStatus;
    } catch (error) {
      logger.error('Failed to check geofence status:', error);
      return 'unknown';
    }
  }, [geofence, mergedConfig.accuracy, onEnter, onExit]);

  /**
   * Start geofence monitoring
   */
  const startMonitoring = useCallback(async (): Promise<boolean> => {
    if (!geofence) {
      logger.info('No geofence provided - monitoring disabled (this is OK)');
      setState(prev => ({ ...prev, isMonitoring: false, status: 'unknown' }));
      return false;
    }

    // Request permission if needed
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        logger.warn('Permission denied - cannot start monitoring');
        return false;
      }
    }

    try {
      // Initial status check
      await checkStatus();

      // Start foreground location updates
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: mergedConfig.accuracy,
          timeInterval: mergedConfig.distanceInterval,
          distanceInterval: 50, // Update elke 50 meter
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const inside = isInsideGeofence(latitude, longitude, geofence);
          const distance = calculateDistance(latitude, longitude, geofence);
          
          const newStatus: GeofenceStatus = inside ? 'inside' : 'outside';
          
          setState(prev => ({
            ...prev,
            status: newStatus,
            distance,
            lastChecked: new Date(),
          }));

          // Detect transition
          if (lastStatusRef.current !== newStatus) {
            const transition: GeofenceTransition = newStatus === 'inside' ? 'enter' : 'exit';
            logger.info(`Geofence transition: ${transition}`, { distance });

            if (transition === 'enter' && onEnter) {
              haptics.success();
              onEnter({
                latitude,
                longitude,
                accuracy: location.coords.accuracy ?? undefined,
                timestamp: location.timestamp,
              });
            } else if (transition === 'exit' && onExit) {
              haptics.warning();
              onExit({
                latitude,
                longitude,
                accuracy: location.coords.accuracy ?? undefined,
                timestamp: location.timestamp,
              });
            }

            lastStatusRef.current = newStatus;
          }
        }
      );

      // Start background location tracking (indien enabled en permission granted)
      if (mergedConfig.enableBackground) {
        const { granted } = await Location.getBackgroundPermissionsAsync();
        if (granted) {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: mergedConfig.accuracy,
            timeInterval: mergedConfig.distanceInterval,
            distanceInterval: 50,
            showsBackgroundLocationIndicator: true,
            foregroundService: mergedConfig.showBackgroundNotification
              ? {
                  notificationTitle: 'DKL Steps Tracking',
                  notificationBody: 'Tracking je locatie voor automatische stappen tellen',
                }
              : undefined,
          });
          logger.info('Background location tracking started');
        }
      }

      setState(prev => ({ ...prev, isMonitoring: true }));
      logger.info('Geofence monitoring started');
      return true;
    } catch (error) {
      logger.error('Failed to start monitoring:', error);
      return false;
    }
  }, [geofence, hasPermission, requestPermission, checkStatus, mergedConfig, onEnter, onExit]);

  /**
   * Stop geofence monitoring
   */
  const stopMonitoring = useCallback(async () => {
    try {
      // Stop foreground subscription
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      // Stop background task
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        logger.info('Background location tracking stopped');
      }

      setState(prev => ({
        ...prev,
        isMonitoring: false,
        status: 'unknown',
      }));

      lastStatusRef.current = 'unknown';
      logger.info('Geofence monitoring stopped');
    } catch (error) {
      logger.error('Failed to stop monitoring:', error);
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    (async () => {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      setHasPermission(foregroundStatus === 'granted');
    })();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isMonitoring) {
        stopMonitoring();
      }
    };
  }, [state.isMonitoring, stopMonitoring]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    checkStatus,
    hasPermission,
    requestPermission,
  };
}

/**
 * Register background location task
 * Dit moet aangeroepen worden in de root van je app (bijv. App.tsx)
 */
export function defineBackgroundLocationTask(
  onLocationUpdate?: (location: BackgroundLocationUpdate) => void
) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
    if (error) {
      logger.error('Background location task error:', error);
      return;
    }

    if (data) {
      const { locations } = data;
      if (locations && locations.length > 0) {
        const location = locations[0];
        const update: BackgroundLocationUpdate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        };

        logger.debug('Background location update:', update);
        
        if (onLocationUpdate) {
          onLocationUpdate(update);
        }
      }
    }
  });
}