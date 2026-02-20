-- Simple Triggers Check - Basic Information Schema Query
-- Execute this in Supabase SQL Editor
-- This script checks for existing triggers without complex column references

-- Check if any triggers exist at all
SELECT 
    'Triggers Existence Check' as check_type,
    COUNT(*) as total_triggers,
    CASE WHEN COUNT(*) > 0 THEN 'Triggers Found' ELSE 'No Triggers' END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
LIMIT 1;

-- Check for admin-related triggers specifically
SELECT 
    'Admin Triggers Check' as check_type,
    trigger_name,
    event_table,
    action_timing,
    action_condition,
    action_orientation,
    created_at
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (event_table LIKE '%balance%' OR event_table LIKE '%user%' OR event_table LIKE '%deposit%' OR event_table LIKE '%withdrawal%')
ORDER BY created_at DESC
LIMIT 10;

-- Check for admin-related functions
SELECT 
    'Admin Functions Check' as check_type,
    routine_name,
    routine_type,
    created_at
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND (routine_name LIKE '%admin%' OR routine_name LIKE '%balance%' OR routine_name LIKE '%user%')
ORDER BY created_at DESC
LIMIT 10;

-- Output summary
SELECT 
    'Simple Triggers Check Completed' as status,
    NOW() as check_time,
    'Review results to identify any admin triggers or functions' as next_step;
