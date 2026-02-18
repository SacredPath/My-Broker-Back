-- Manually check and process stuck data

-- First, see what's in the bypass table
SELECT 
    'BEFORE PROCESS' as status,
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

-- Now manually run the process function
SELECT process_admin_balance_updates();

-- Check what's in bypass table after processing
SELECT 
    'AFTER PROCESS' as status,
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

-- Check if main tables were updated
SELECT 
    'USER_BALANCES AFTER' as status,
    user_id, 
    currency, 
    amount, 
    usd_value, 
    updated_at
FROM user_balances 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
ORDER BY updated_at DESC;

SELECT 
    'WALLET_BALANCES AFTER' as status,
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
