-- Test the autogrowth system (FIXED VERSION)

-- 1. Check if tables were created
SELECT 
    'daily_autogrowth_log' as component,
    'table' as type,
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_name = 'daily_autogrowth_log' AND table_schema = 'public'

UNION ALL

-- 2. Check if functions were created
SELECT 
    'calculate_daily_autogrowth' as component,
    'function' as type,
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_proc 
WHERE proname = 'calculate_daily_autogrowth'

UNION ALL

SELECT 
    'trigger_daily_autogrowth' as component,
    'function' as type,
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_proc 
WHERE proname = 'trigger_daily_autogrowth'

UNION ALL

-- 3. Check permissions
SELECT 
    'daily_autogrowth_log permissions' as component,
    'permissions' as type,
    'OK' as status
FROM information_schema.table_privileges 
WHERE table_name = 'daily_autogrowth_log' AND table_schema = 'public' LIMIT 1;

-- 4. Test the trigger function (dry run)
SELECT 'trigger_test' as component, 'function_call' as type, 
       CASE WHEN success IS NOT NULL THEN 'WORKS' ELSE 'FAILED' END as status
FROM trigger_daily_autogrowth() LIMIT 1;
