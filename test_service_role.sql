-- Test if service_role permissions are working

-- Simple test - check if service_role can access user_balances
SELECT COUNT(*) as test_count 
FROM user_balances 
LIMIT 1;

-- Test if process function can execute
SELECT process_admin_balance_updates();

-- Check if any records were processed
SELECT COUNT(*) as unprocessed_after 
FROM admin_balance_updates 
WHERE processed = FALSE;
