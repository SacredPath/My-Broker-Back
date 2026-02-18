-- Check if the balance updates are actually saving to database
-- Look for the specific user that was just updated

-- Check user_balances table for the updated user
SELECT 
    user_id, 
    currency, 
    amount, 
    usd_value, 
    created_at, 
    updated_at
FROM user_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;

-- Check wallet_balances table for the updated user
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

-- Check admin_balance_updates table to see if bypass table was used
SELECT 
    user_id, 
    currency, 
    available, 
    locked, 
    amount, 
    usd_value, 
    processed, 
    created_at
FROM admin_balance_updates 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY created_at DESC;

-- Check recent changes to both tables
SELECT 'user_balances' as table_name, user_id, currency, CAST(amount AS TEXT) as amount, updated_at
FROM user_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND updated_at > NOW() - INTERVAL '10 minutes'

UNION ALL

SELECT 'wallet_balances' as table_name, user_id, currency, CAST(available AS TEXT) as amount, updated_at
FROM wallet_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND updated_at > NOW() - INTERVAL '10 minutes'
ORDER BY updated_at DESC;
