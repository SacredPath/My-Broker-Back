-- Check if data is stuck in the bypass table
SELECT 
    user_id, 
    currency, 
    amount, 
    available, 
    locked, 
    usd_value, 
    processed, 
    created_at
FROM admin_balance_updates 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY created_at DESC;

-- Check wallet_balances table
SELECT 
    user_id, 
    currency, 
    available, 
    locked, 
    total, 
    created_at, 
    updated_at
FROM wallet_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;

-- Check if the process function exists and works
SELECT proname, prosrc FROM pg_proc WHERE proname = 'process_admin_balance_updates';
