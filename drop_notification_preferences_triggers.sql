-- Check and drop triggers on notification_preferences table
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'notification_preferences'
    AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Drop any triggers on notification_preferences that might be causing issues
DROP TRIGGER IF EXISTS handle_notification_preferences_updated_at_trigger ON notification_preferences;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS handle_notification_preferences_updated_at();

-- Verify no triggers remain
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'notification_preferences'
    AND NOT t.tgisinternal
ORDER BY t.tgname;
