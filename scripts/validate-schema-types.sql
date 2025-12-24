-- Schema Type Validation Script
-- This script validates that analytics_events.user_id matches auth.users.id type
-- Run this with: psql <your-database-url> -f scripts/validate-schema-types.sql

\echo '=================================='
\echo 'Database Schema Type Validation'
\echo '=================================='
\echo ''

-- Check analytics_events table exists
\echo 'Checking analytics_events table...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'analytics_events'
        )
        THEN '✓ analytics_events table exists'
        ELSE '✗ analytics_events table NOT FOUND'
    END AS status;

-- Check user_id column type
\echo ''
\echo 'Checking analytics_events.user_id column type...'
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN data_type = 'uuid' THEN '✓ Correct type (UUID)'
        ELSE '✗ INCORRECT type (expected UUID, got ' || data_type || ')'
    END AS type_validation
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'analytics_events' 
AND column_name = 'user_id';

-- Check auth.users.id type
\echo ''
\echo 'Checking auth.users.id column type...'
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✓ Correct type (UUID)'
        ELSE '✗ INCORRECT type (expected UUID, got ' || data_type || ')'
    END AS type_validation
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND column_name = 'id';

-- Verify type alignment
\echo ''
\echo 'Verifying type alignment...'
DO $$
DECLARE
    analytics_user_id_type text;
    auth_users_id_type text;
BEGIN
    -- Get analytics_events.user_id type
    SELECT data_type INTO analytics_user_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'analytics_events' 
    AND column_name = 'user_id';
    
    -- Get auth.users.id type
    SELECT data_type INTO auth_users_id_type
    FROM information_schema.columns
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'id';
    
    -- Verify they match
    IF analytics_user_id_type IS NULL THEN
        RAISE EXCEPTION '✗ analytics_events.user_id column not found';
    END IF;
    
    IF analytics_user_id_type != 'uuid' THEN
        RAISE EXCEPTION '✗ analytics_events.user_id type is %, expected uuid', analytics_user_id_type;
    END IF;
    
    IF auth_users_id_type != 'uuid' THEN
        RAISE EXCEPTION '✗ auth.users.id type is %, expected uuid', auth_users_id_type;
    END IF;
    
    RAISE NOTICE '✓ Type alignment verified: both are UUID';
    RAISE NOTICE '✓ analytics_events.user_id: %', analytics_user_id_type;
    RAISE NOTICE '✓ auth.users.id: %', auth_users_id_type;
END $$;

-- Check foreign key constraints
\echo ''
\echo 'Checking foreign key constraints...'
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✓ Foreign key exists' AS status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name = 'analytics_events'
    AND kcu.column_name = 'user_id';

-- Check indexes on user_id
\echo ''
\echo 'Checking indexes on analytics_events.user_id...'
SELECT 
    indexname,
    indexdef,
    '✓ Index exists' AS status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'analytics_events'
AND indexdef LIKE '%user_id%';

\echo ''
\echo '=================================='
\echo 'Validation Complete!'
\echo '=================================='
