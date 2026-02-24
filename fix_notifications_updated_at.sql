-- Fix the notifications table by adding the missing updated_at column
-- This will resolve the error: record "new" has no field "updated_at"

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a trigger to automatically update updated_at on notification updates
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
CREATE TRIGGER notifications_updated_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Verify the fix
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;
