-- Simple Admin Context Check (No Errors)
-- This will definitively identify the issue

-- 1. Check current admin user
SELECT current_user as admin_user;

-- 2. Check admin role
SELECT rolname, rolsuper as is_superuser 
FROM pg_roles 
WHERE rolname = current_user;

-- 3. Check RLS policies on deposit_methods
SELECT COUNT(*) as rls_policy_count 
FROM pg_policies 
WHERE tablename = 'deposit_methods';

-- 4. Test direct update (this will tell us if database updates work)
UPDATE deposit_methods 
SET instructions = 'DIRECT SQL TEST - ' || EXTRACT(EPOCH FROM NOW())
WHERE method_type = 'ach' AND currency = 'USD';

-- 5. Verify test update
SELECT instructions, updated_at 
FROM deposit_methods 
WHERE method_type = 'ach' AND currency = 'USD';
