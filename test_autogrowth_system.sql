-- Test the autogrowth system

-- 1. Check if tables and functions were created
SELECT 
    'daily_autogrowth_log' as table_name,
    COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_name = 'daily_autogrowth_log' AND table_schema = 'public'

UNION ALL

SELECT 
    'calculate_daily_autogrowth' as function_name,
    'OK' as status
FROM pg_proc 
WHERE proname = 'calculate_daily_autogrowth'

UNION ALL

SELECT 
    'trigger_daily_autogrowth' as function_name,
    'OK' as status
FROM pg_proc 
WHERE proname = 'trigger_daily_autogrowth';

-- 2. Test the trigger function (dry run)
SELECT * FROM trigger_daily_autogrowth() LIMIT 1;

-- 3. Check if we can query the log table
SELECT COUNT(*) as log_records FROM daily_autogrowth_log;
