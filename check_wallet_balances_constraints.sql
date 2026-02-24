-- Check wallet_balances table structure with constraints
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    generation_expression
FROM information_schema.columns 
WHERE table_name = 'wallet_balances' 
ORDER BY ordinal_position;

-- Check for any constraints on the total column
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'wallet_balances'::regclass
    AND conname LIKE '%total%';
