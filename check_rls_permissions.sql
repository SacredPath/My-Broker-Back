-- Check RLS Policies and Permissions for deposit_methods table
-- This will help identify why updates aren't persisting

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'deposit_methods';

-- 2. Check RLS policies on deposit_methods
SELECT 
    nsp.nspname as schemaname,
    c.relname as tablename,
    p.polname as policyname,
    p.polpermissive as permissive,
    p.polroles as roles,
    p.polcmd as cmd,
    pg_get_exprdef(p.polqual, false) as qual,
    pg_get_exprdef(p.polwithcheck, false) as with_check
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace nsp ON c.relnamespace = nsp.oid
WHERE c.relname = 'deposit_methods';

-- 3. Check current user permissions
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'deposit_methods'
ORDER BY grantee, privilege_type;

-- 4. Check if there are any triggers that might be interfering
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    action_condition,
    action_orientation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'deposit_methods';

-- 5. Check recent activity on deposit_methods
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_tup_hot_upd
FROM pg_stat_user_tables 
WHERE tablename = 'deposit_methods';
