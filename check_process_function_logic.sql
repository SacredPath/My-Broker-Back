-- Check the actual process function logic to find the bug

-- Look at the function source code
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'process_admin_balance_updates';

-- Check if there are any unprocessed records first
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
LIMIT 5;

-- Test the UPDATE statements manually to see if they work
-- Test user_balances update
UPDATE user_balances ub
SET 
    amount = 1000.00,
    usd_value = 1000.00,
    updated_at = NOW()
WHERE ub.user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND ub.currency = 'USD';

-- Check if user_balances was updated
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

-- Test wallet_balances update
UPDATE wallet_balances wb
SET 
    available = 500.00,
    locked = 200.00,
    updated_at = NOW()
WHERE wb.user_id = 'e2ae0986-8b81-4df7-771f-8330ee9f8a85' 
    AND wb.currency = 'USD';

-- Check if wallet_balances was updated
SELECT 
    user_id, 
    currency, 
    available, 
    locked, 
    total, 
    updated_at
FROM wallet_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-771f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;
