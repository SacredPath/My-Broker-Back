-- Check existing notifications table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if notification_settings table exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data from notifications table
SELECT * FROM notifications LIMIT 3;

-- Check sample data from notification_settings table if it exists
SELECT * FROM notification_settings LIMIT 3;
