-- Debug the process function step by step

-- Check if there are unprocessed records
SELECT COUNT(*) as unprocessed_count 
FROM admin_balance_updates 
WHERE processed = FALSE;

-- Show the specific records that need processing
SELECT 
    user_id, 
    currency, 
    amount, 
    available, 
    locked, 
    usd_value, 
    processed
FROM admin_balance_updates 
WHERE processed = FALSE 
ORDER BY created_at DESC;

-- Test the process function step by step
-- First, let's see what the function should do by running it manually
-- but first check if there are any records to process

-- Try to identify the issue:
-- 1. Check if function exists and has proper permissions
SELECT 
    routine_name, 
    routine_schema, 
    security_type 
FROM information_schema.routines 
WHERE routine_name = 'process_admin_balance_updates';

-- 2. Check if there are any RLS policies that might block it
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('admin_balance_updates', 'user_balances', 'wallet_balances');
