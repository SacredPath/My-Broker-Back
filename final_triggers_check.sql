-- Final Triggers Check - Corrected Column Names
-- Execute this in Supabase SQL Editor
-- This script uses correct information_schema column names

-- First, let's see what columns actually exist in information_schema.triggers
SELECT 
    'Available Columns in triggers table' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'information_schema'
AND table_name = 'triggers'
ORDER BY column_name;

-- Then check if any triggers exist with correct column names
SELECT 
    'Basic Triggers Check' as check_type,
    trigger_name,
    action_timing,
    action_orientation,
    created
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY created DESC
LIMIT 10;

-- Check for admin-related functions
SELECT 
    'Admin Functions Check' as check_type,
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND (routine_name LIKE '%admin%' OR routine_name LIKE '%balance%' OR routine_name LIKE '%user%')
ORDER BY created DESC
LIMIT 10;

-- Output summary
SELECT 
    'Final Triggers Check Completed' as status,
    NOW() as check_time,
    'Review results to identify any admin triggers or functions' as next_step;
