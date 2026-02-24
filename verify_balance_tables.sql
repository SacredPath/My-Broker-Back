-- Check user_balances table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
ORDER BY ordinal_position;

-- Check wallet_balances table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_balances' 
ORDER BY ordinal_position;

-- Check current data in user_balances
SELECT 
    user_id,
    currency,
    amount,
    usd_value,
    updated_at
FROM user_balances 
ORDER BY updated_at DESC
LIMIT 5;

-- Check current data in wallet_balances
SELECT 
    user_id,
    currency,
    available,
    locked,
    total,
    updated_at
FROM wallet_balances 
ORDER BY updated_at DESC
LIMIT 5;
