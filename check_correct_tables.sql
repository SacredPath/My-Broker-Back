-- Check what tables actually exist for users and audit_log
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name LIKE '%user%' OR table_name LIKE '%profile%')
ORDER BY table_name;

-- Check audit_log table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
    AND column_name LIKE '%user%'
ORDER BY ordinal_position;

-- Check what admin users exist in profiles table
SELECT id, email, role FROM profiles 
WHERE role = 'admin' OR role ILIKE '%admin%'
LIMIT 5;
