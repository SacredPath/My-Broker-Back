-- Drop ALL notification triggers completely
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
DROP TRIGGER IF EXISTS notifications_updated_at_update_trigger ON notifications;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- Verify no triggers remain
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'notifications'
    AND NOT t.tgisinternal
ORDER BY t.tgname;
