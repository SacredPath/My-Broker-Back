-- Examine balance-related tables in detail
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN ('user_balances', 'wallet_balances', 'profiles')
ORDER BY table_name, column_name;

-- Also check if profiles table has balance column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name ILIKE '%balance%'
ORDER BY column_name;
