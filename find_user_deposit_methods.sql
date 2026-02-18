-- Find User Deposit Methods - Comprehensive Query
-- This query will help you find where user deposit methods are stored

-- 1. First, let's see all tables in your database
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Look for tables that might contain deposit/payment methods
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND (table_name ILIKE '%deposit%' 
         OR table_name ILIKE '%payment%'
         OR table_name ILIKE '%method%'
         OR table_name ILIKE '%wallet%'
         OR table_name ILIKE '%bank%'
         OR table_name ILIKE '%crypto%'
         OR table_name ILIKE '%paypal%')
ORDER BY table_name, ordinal_position;

-- 3. Look for columns that might contain deposit method information
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND (column_name ILIKE '%deposit%'
         OR column_name ILIKE '%payment%'
         OR column_name ILIKE '%method%'
         OR column_name ILIKE '%wallet%'
         OR column_name ILIKE '%bank%'
         OR column_name ILIKE '%crypto%'
         OR column_name ILIKE '%paypal%'
         OR column_name ILIKE '%address%'
         OR column_name ILIKE '%iban%'
         OR column_name ILIKE '%routing%'
         OR column_name ILIKE '%account%')
ORDER BY table_name, ordinal_position;

-- 4. Check if there's a user profiles or settings table that might contain deposit preferences
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND (table_name ILIKE '%user%' 
         OR table_name ILIKE '%profile%'
         OR table_name ILIKE '%setting%'
         OR table_name ILIKE '%preference%')
ORDER BY table_name, ordinal_position;

-- 5. Look for any existing deposit_methods table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND table_name = 'deposit_methods'
ORDER BY ordinal_position;

-- 6. Check for any system settings or configuration tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    AND (table_name ILIKE '%setting%'
         OR table_name ILIKE '%config%'
         OR table_name ILIKE '%system%'
         OR table_name ILIKE '%admin%')
ORDER BY table_name, ordinal_position;
