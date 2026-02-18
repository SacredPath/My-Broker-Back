-- Examine all tables in the database to find balance-related columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND (
        column_name ILIKE '%balance%' 
        OR column_name ILIKE '%amount%'
        OR column_name ILIKE '%wallet%'
        OR column_name ILIKE '%fund%'
        OR column_name ILIKE '%money%'
        OR column_name ILIKE '%credit%'
        OR column_name ILIKE '%debit%'
    )
ORDER BY table_name, column_name;

-- Also show all tables to understand the full structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
