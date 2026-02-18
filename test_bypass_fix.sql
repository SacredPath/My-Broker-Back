-- Test if the bypass system now works after RLS fix

-- First, check if there are still unprocessed records
SELECT COUNT(*) as unprocessed_count 
FROM admin_balance_updates 
WHERE processed = FALSE;

-- Manually run the process function to test it
SELECT process_admin_balance_updates();

-- Check if records were processed
SELECT COUNT(*) as unprocessed_count_after 
FROM admin_balance_updates 
WHERE processed = FALSE;

-- Check if main tables were updated
SELECT 
    'WALLET_BALANCES AFTER FIX' as status,
    user_id, 
    currency, 
    available, 
    locked, 
    total, 
    updated_at
FROM wallet_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;

SELECT 
    'USER_BALANCES AFTER FIX' as status,
    user_id, 
    currency, 
    amount, 
    usd_value, 
    updated_at
FROM user_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;
