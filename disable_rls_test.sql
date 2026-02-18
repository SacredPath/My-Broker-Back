-- Temporarily disable RLS to test if service role works
ALTER TABLE wallet_balances DISABLE ROW LEVEL SECURITY;

-- Test insert operation
INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
VALUES ('5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 100.00, 0.00, NOW(), NOW())
ON CONFLICT (user_id, currency) DO UPDATE SET
    available = EXCLUDED.available,
    locked = EXCLUDED.locked,
    updated_at = NOW();

-- Check if insert worked
SELECT * FROM wallet_balances 
WHERE user_id = '5261222f-07e1-4c61-a7e6-9d5919c96f73' AND currency = 'USD';

-- Re-enable RLS after test
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
