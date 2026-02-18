-- Quick Check: Current Deposit Methods Table
-- Run this first to see what's currently in the deposit_methods table

-- 1. See the structure of deposit_methods table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deposit_methods'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. See all data in deposit_methods table
SELECT * FROM deposit_methods;

-- 3. Check if there are any user-specific deposit methods
SELECT 
    method_type,
    currency,
    COUNT(*) as count,
    is_active,
    MIN(created_at) as first_created,
    MAX(updated_at) as last_updated
FROM deposit_methods 
GROUP BY method_type, currency, is_active
ORDER BY method_type, currency;

-- 4. Look for any user_id or user reference columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'deposit_methods'
    AND (column_name ILIKE '%user%' OR column_name ILIKE '%profile%');

-- 5. Check if there are other related tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND (table_name ILIKE '%user%' OR table_name ILIKE '%deposit%')
ORDER BY table_name;
