-- Test if service role can bypass RLS with direct auth
-- Set the role explicitly for this session
SET LOCAL ROLE service_role;

-- Test insert with service role context
INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
VALUES ('8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 150.00, 0.00, NOW(), NOW())
ON CONFLICT (user_id, currency) DO UPDATE SET
    available = EXCLUDED.available,
    locked = EXCLUDED.locked,
    updated_at = NOW();

-- Reset role back
RESET ROLE;

-- Check result
SELECT * FROM wallet_balances 
WHERE user_id = '8c974284-3ca1-4184-83bc-7c17480d8e55' AND currency = 'USD';
