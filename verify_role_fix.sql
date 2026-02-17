-- Quick test to verify service_role is working

-- Test 1: Check if service_role exists and has permissions
SELECT 
    EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') as service_role_exists,
    EXISTS (SELECT 1 FROM information_schema.role_table_grants 
        WHERE grantee = 'service_role' 
        AND table_name = 'user_balances' 
        AND privilege_type = 'SELECT') as can_access_user_balances,
    (SELECT COUNT(*) FROM user_balances LIMIT 1) > 0 as test_access
FROM (
    SELECT 
        EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') as service_role_exists,
        EXISTS (SELECT 1 FROM information_schema.role_table_grants 
        WHERE grantee = 'service_role' 
        AND table_name = 'user_balances' 
        AND privilege_type = 'SELECT') as can_access_user_balances,
        (SELECT COUNT(*) FROM user_balances LIMIT 1) > 0 as test_access
) as test_results;

-- Reset role
RESET ROLE;

-- Show results
SELECT 
    'service_role_exists',
    'can_access_user_balances',
    'test_access'
FROM (
    SELECT 
        EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') as service_role_exists,
        EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE grantee = 'service_role' AND table_name = 'user_balances' AND privilege_type = 'SELECT') as can_access_user_balances,
        (SELECT COUNT(*) FROM user_balances LIMIT 1) > 0 as test_access
) as test_results;
