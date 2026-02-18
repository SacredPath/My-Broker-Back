-- Check user_balances table structure and existing records

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any records for this user
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

-- Check if there are any records that need processing in bypass table
SELECT 
    user_id, 
    currency, 
    amount, 
    usd_value, 
    processed,
    created_at
FROM admin_balance_updates 
WHERE user_id = 'e2ae0986-8b81-4df7-871f-8330ee9f8a85' 
    AND currency = 'USD'
    AND processed = FALSE
ORDER BY created_at DESC;
