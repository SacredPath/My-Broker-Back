-- Check if there are unprocessed records in bypass table for this specific user

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
    AND processed = FALSE
ORDER BY created_at DESC;

-- If there are unprocessed records, let's manually process one to test
UPDATE user_balances ub
SET 
    amount = 999.99,
    usd_value = 999.99,
    updated_at = NOW()
WHERE ub.user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND ub.currency = 'USD';

-- Check if manual update worked
SELECT 
    user_id, 
    currency, 
    amount, 
    usd_value, 
    updated_at
FROM user_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;
