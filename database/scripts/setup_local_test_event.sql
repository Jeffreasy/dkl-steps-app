-- Setup Test Event for LOCAL Docker Development
-- Docker PostgreSQL: localhost:5433
-- Database: dkl_db
--
-- Run: psql -h localhost -p 5433 -U postgres -d dkl_db -f setup_local_test_event.sql

-- Clean up any existing test events
DELETE FROM event_participants WHERE event_id IN (
    SELECT id FROM events WHERE name LIKE '%Test%'
);

DELETE FROM events WHERE name LIKE '%Test%';

-- Insert LOCAL test event (Utrecht coordinates - makkelijk te testen)
INSERT INTO events (
    id,
    name,
    description,
    start_time,
    end_time,
    status,
    is_active,
    geofences,
    event_config,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'De Koninklijke Loop 2025 - LOCAL TEST',
    'Local development test event - Utrecht centrum coordinaten',
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    'active',
    true,
    '[
        {
            "type": "start",
            "lat": 52.0907,
            "long": 5.1214,
            "radius": 500,
            "name": "Start - Utrecht Domplein"
        },
        {
            "type": "checkpoint",
            "lat": 52.0950,
            "long": 5.1300,
            "radius": 300,
            "name": "Checkpoint - Maliebaan"
        },
        {
            "type": "checkpoint",
            "lat": 52.0865,
            "long": 5.1180,
            "radius": 300,
            "name": "Checkpoint - Centraal Station"
        },
        {
            "type": "finish",
            "lat": 52.0907,
            "long": 5.1214,
            "radius": 500,
            "name": "Finish - Utrecht Domplein"
        }
    ]'::jsonb,
    '{
        "minStepsInterval": 10,
        "requireGeofenceCheckin": true,
        "distanceThreshold": 100,
        "accuracyLevel": "balanced",
        "maxParticipants": 1000,
        "autoStart": true
    }'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify event created
SELECT 
    id,
    name,
    status,
    is_active,
    start_time,
    end_time,
    jsonb_array_length(geofences) as geofence_count
FROM events
WHERE is_active = true
ORDER BY created_at DESC;

-- Show geofences detail
SELECT 
    name,
    jsonb_pretty(geofences) as geofences_detail
FROM events
WHERE name LIKE '%LOCAL TEST%';

-- Summary
SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE is_active = true) as active_events,
    COUNT(*) FILTER (WHERE status = 'active') as status_active
FROM events;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Local test event created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📍 Event: De Koninklijke Loop 2025 - LOCAL TEST';
    RAISE NOTICE '📍 Location: Utrecht Domplein (52.0907, 5.1214)';
    RAISE NOTICE '📍 Radius: 500 meters';
    RAISE NOTICE '📍 Geofences: 4 (start, 2x checkpoint, finish)';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test in app:';
    RAISE NOTICE '   1. Open app';
    RAISE NOTICE '   2. Login als deelnemer';
    RAISE NOTICE '   3. Enable "Event Locatie Tracking"';
    RAISE NOTICE '   4. Spoof GPS: 52.0907, 5.1214';
    RAISE NOTICE '   5. Status should show: "✓ Binnen Gebied"';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 API Test:';
    RAISE NOTICE '   curl http://localhost:8082/api/events/active';
END $$;