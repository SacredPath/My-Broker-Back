-- Check deposit methods related tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name LIKE '%deposit%' OR table_name LIKE '%method%')
ORDER BY table_name;

-- Check deposit methods table structure if it exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deposit_methods' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check user deposit methods table structure if it exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_deposit_methods' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check any payment methods table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on deposit-related tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('deposit_methods', 'user_deposit_methods', 'payment_methods') 
    AND schemaname = 'public'
ORDER BY tablename, policyname;
