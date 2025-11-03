-- Setup Test Event for PRODUCTION (Render PostgreSQL)
-- Run via Render Shell: psql $DATABASE_URL
-- OR via API (zie docs/GPS_SETUP_GUIDE.md "Optie 2")

-- Clean up any existing test events (veilig - alleen test events)
DELETE FROM event_participants WHERE event_id IN (
    SELECT id FROM events WHERE description LIKE '%Test%' OR name LIKE '%Test%'
);

DELETE FROM events 
WHERE description LIKE '%Test%' OR name LIKE '%Test%';

-- Insert PRODUCTION test event (Dronten - Spiegelstraat 6)
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
    '4fb1dd30-1465-4a0d-b5e0-6ae814109182',
    'De Koninklijke Loop 2025 - GPS Test',
    'Test event voor GPS geofencing in Dronten',
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    'active',
    true,
    '[
        {
            "type": "start",
            "lat": 52.5185,
            "long": 5.7220,
            "radius": 500,
            "name": "Start - Dronten Spiegelstraat"
        },
        {
            "type": "checkpoint",
            "lat": 52.5228,
            "long": 5.7306,
            "radius": 300,
            "name": "Checkpoint Noord"
        },
        {
            "type": "checkpoint",
            "lat": 52.5142,
            "long": 5.7134,
            "radius": 300,
            "name": "Checkpoint Zuid"
        },
        {
            "type": "finish",
            "lat": 52.5185,
            "long": 5.7220,
            "radius": 500,
            "name": "Finish - Dronten Spiegelstraat"
        }
    ]'::jsonb,
    '{
        "minStepsInterval": 10,
        "requireGeofenceCheckin": true,
        "distanceThreshold": 100,
        "accuracyLevel": "balanced",
        "maxParticipants": 5000,
        "autoStart": true
    }'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    geofences = EXCLUDED.geofences,
    event_config = EXCLUDED.event_config,
    updated_at = CURRENT_TIMESTAMP;

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
    jsonb_pretty(geofences) as geofences_detail,
    jsonb_pretty(event_config) as event_config_detail
FROM events
WHERE name LIKE '%GPS Test%';

-- Summary
SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE is_active = true) as active_events,
    COUNT(*) FILTER (WHERE status = 'active') as status_active,
    COUNT(*) FILTER (WHERE name LIKE '%GPS Test%') as test_events
FROM events;

-- Success message
DO $$
DECLARE
    event_count INT;
BEGIN
    SELECT COUNT(*) INTO event_count FROM events WHERE name LIKE '%GPS Test%' AND is_active = true;
    
    IF event_count > 0 THEN
        RAISE NOTICE '✅ Production test event created successfully!';
        RAISE NOTICE '';
        RAISE NOTICE '📍 Event: De Koninklijke Loop 2025 - GPS Test';
        RAISE NOTICE '📍 Location: Spiegelstraat 6, Dronten';
        RAISE NOTICE '📍 Coordinates: 52.5185, 5.7220';
        RAISE NOTICE '📍 Radius: 500 meters';
        RAISE NOTICE '📍 Geofences: 4 (start, 2x checkpoint, finish)';
        RAISE NOTICE '';
        RAISE NOTICE '🔗 Verify API:';
        RAISE NOTICE '   curl https://dklemailservice.onrender.com/api/events/active';
        RAISE NOTICE '';
        RAISE NOTICE '🧪 Test in App:';
        RAISE NOTICE '   1. Open mobile app';
        RAISE NOTICE '   2. Login als deelnemer';
        RAISE NOTICE '   3. Enable "Event Locatie Tracking" (beta card)';
        RAISE NOTICE '   4. Grant GPS permission ("Always Allow")';
        RAISE NOTICE '   5. Spoof GPS naar 52.5185, 5.7220 (in emulator)';
        RAISE NOTICE '      OR loop fysiek naar Spiegelstraat 6, Dronten';
        RAISE NOTICE '   6. Status should show: "✓ Binnen Gebied"';
        RAISE NOTICE '   7. SimpleStepDisplay: "✓ Tracking Actief"';
        RAISE NOTICE '   8. Pedometer counts steps! 🎉';
    ELSE
        RAISE EXCEPTION '❌ Failed to create test event';
    END IF;
END $$;