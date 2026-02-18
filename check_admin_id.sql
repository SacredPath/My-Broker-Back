-- Check what admin ID is being used and if it exists in users table
SELECT 'Checking admin ID from session' as info;

-- Check if the admin ID exists in users table
SELECT id, email, role FROM users 
WHERE id = '707883d7-9a93-4a14-af51-6c559de578d8';

-- Check all admin users
SELECT id, email, role FROM users 
WHERE role = 'admin' OR role ILIKE '%admin%';

-- Check audit_log table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
    AND column_name = 'actor_user_id';
