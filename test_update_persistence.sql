-- Test Update and Verify
-- This will test if updates actually persist

-- 1. First, see current state
SELECT 'BEFORE UPDATE' as status, * FROM deposit_methods WHERE method_type = 'crypto' AND currency = 'BTC';

-- 2. Make a test update
UPDATE deposit_methods 
SET address = 'TEST_ADDRESS_' || EXTRACT(EPOCH FROM NOW())::text,
    updated_at = NOW()
WHERE method_type = 'crypto' AND currency = 'BTC';

-- 3. Check if update persisted
SELECT 'AFTER UPDATE' as status, * FROM deposit_methods WHERE method_type = 'crypto' AND currency = 'BTC';

-- 4. Check if there are multiple records (duplicates)
SELECT 
    method_type,
    currency,
    COUNT(*) as record_count,
    STRING_AGG(id::text, ', ') as all_ids
FROM deposit_methods 
WHERE method_type IN ('crypto', 'paypal', 'ach')
GROUP BY method_type, currency
ORDER BY method_type, currency;
