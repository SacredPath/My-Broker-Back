-- Check admin_users table column structure specifically
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
