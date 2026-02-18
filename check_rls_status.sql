-- Check RLS Status and Policies
-- This will definitively show if RLS is blocking updates

-- 1. Check if RLS is enabled (this is the key query)
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_enforced
FROM pg_class 
WHERE relname = 'deposit_methods';

-- 2. Get actual RLS policies that are active (simpler version)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type
FROM pg_policies 
WHERE tablename = 'deposit_methods';

-- 3. Test if admin can bypass RLS
-- This simulates what happens when admin tries to update
SELECT 
    current_user as session_user,
    current_user as current_session_user,
    has_table_privilege('deposit_methods', 'UPDATE') as can_update,
    has_schema_privilege('public', 'USAGE') as can_use_schema;
