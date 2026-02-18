-- Check the exact structure of wallet_balances table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_generated
FROM information_schema.columns 
WHERE table_name = 'wallet_balances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
