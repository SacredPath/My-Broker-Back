-- Simple Test: Check What Admin User Actually Is
-- This will help identify the root issue

-- 1. Check current admin user context
SELECT 
    current_user as admin_user,
    current_database() as database_name,
    current_schema() as schema_name;

-- 2. Check if admin user has proper role membership
SELECT 
    rolname as role_name,
    rolcanlogin as can_login,
    rolsuper as is_superuser
FROM pg_roles 
WHERE rolname = current_user;

-- 3. Check if there are any RLS policies that might block admin
SELECT 
    'RLS Enabled' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'deposit_methods'
GROUP BY 'RLS Enabled';

-- 4. Test a simple direct update to see what happens
-- This bypasses any application logic and goes direct to database
UPDATE deposit_methods 
SET instructions = 'TEST UPDATE FROM DIRECT SQL - ' || NOW()
WHERE method_type = 'ach' AND currency = 'USD';

-- 5. Verify if the test update worked
SELECT 
    'AFTER TEST UPDATE' as status,
    instructions,
    updated_at
FROM deposit_methods 
WHERE method_type = 'ach' AND currency = 'USD';

-- 3. Check if there are any RLS policies that might block admin
SELECT 
    'RLS Enabled' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'deposit_methods';

-- 4. Test a simple direct update to see what happens
-- This bypasses any application logic and goes direct to database
UPDATE deposit_methods 
SET instructions = 'TEST UPDATE FROM DIRECT SQL - ' || NOW()
WHERE method_type = 'ach' AND currency = 'USD';

-- 5. Verify if the test update worked
SELECT 
    'AFTER TEST UPDATE' as status,
    instructions,
    updated_at
FROM deposit_methods 
WHERE method_type = 'ach' AND currency = 'USD';
