-- Check the actual structure of daily_autogrowth_log table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_autogrowth_log' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
