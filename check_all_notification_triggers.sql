-- Check ALL triggers on notifications table
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled,
    CASE 
        WHEN t.tgtype & 2 != 0 THEN 'BEFORE'
        WHEN t.tgtype & 4 != 0 THEN 'AFTER'
        ELSE 'INSTEAD OF'
    END as trigger_timing,
    CASE 
        WHEN t.tgtype & 1 != 0 THEN 'INSERT'
        WHEN t.tgtype & 8 != 0 THEN 'UPDATE'
        WHEN t.tgtype & 16 != 0 THEN 'DELETE'
        WHEN (t.tgtype & 1) != 0 AND (t.tgtype & 8) != 0 THEN 'INSERT/UPDATE'
        ELSE 'UNKNOWN'
    END as trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'notifications'
    AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Also check if there are any other triggers that might affect notifications
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname LIKE '%notification%'
    AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
