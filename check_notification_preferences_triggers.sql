-- Check triggers on notification_preferences table
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
WHERE c.relname = 'notification_preferences'
    AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Check if notification_preferences table has updated_at column
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_preferences' 
ORDER BY ordinal_position;
