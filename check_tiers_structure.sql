-- Check existing investment tiers table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investment_tiers' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing tier data
SELECT * FROM investment_tiers ORDER BY sort_order;
