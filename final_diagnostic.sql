-- FINAL DIAGNOSTIC QUERY
-- Run this to identify the exact issue

-- 1. Current admin user
SELECT current_user as admin_user;

-- 2. Admin role check
SELECT rolname, rolsuper as is_superuser 
FROM pg_roles 
WHERE rolname = current_user;

-- 3. RLS policies count
SELECT COUNT(*) as rls_policy_count 
FROM pg_policies 
WHERE tablename = 'deposit_methods';

-- 4. Test direct update
UPDATE deposit_methods 
SET instructions = 'DIRECT SQL TEST ' || NOW()
WHERE method_type = 'ach' AND currency = 'USD';

-- 5. Verify update
SELECT instructions, updated_at 
FROM deposit_methods 
WHERE method_type = 'ach' AND currency = 'USD';
