-- Check admin_users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing admin users
SELECT * FROM admin_users ORDER BY created_at DESC LIMIT 5;
