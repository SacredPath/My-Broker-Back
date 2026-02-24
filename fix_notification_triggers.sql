-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS handle_notifications_updated_at_trigger ON notifications;
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;

-- Drop the old trigger functions
DROP FUNCTION IF EXISTS handle_notifications_updated_at();
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- Create a single, clean trigger function
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for INSERT operations
CREATE TRIGGER notifications_updated_at_trigger
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Also create trigger for UPDATE operations
CREATE TRIGGER notifications_updated_at_update_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Verify the triggers
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled,
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
