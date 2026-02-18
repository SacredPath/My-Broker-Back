-- Simple RLS Check for Supabase
-- This will work with Supabase's PostgreSQL version

-- 1. Check if RLS is enabled on deposit_methods
SELECT 
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'deposit_methods';

-- 2. Check RLS policies (simpler version)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type
FROM pg_policies 
WHERE tablename = 'deposit_methods';

-- 3. Check table permissions
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'deposit_methods'
ORDER BY privilege_type;
