-- Verify the fix worked by checking bypass table is clean
SELECT COUNT(*) as remaining_unprocessed,
       'Should be 0 if cleanup worked' as status
FROM admin_balance_updates 
WHERE processed = FALSE;

-- Also verify function exists and is valid
SELECT 
    proname as function_name,
    pronargs as num_args,
    'process_admin_balance_updates' as expected_name
FROM pg_proc 
WHERE proname = 'process_admin_balance_updates';
