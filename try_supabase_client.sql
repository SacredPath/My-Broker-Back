-- Try using Supabase client instead of raw REST
-- This might handle RLS and service role better

-- First, let's check if we can use the service role with a different approach
-- Try using the service role key in a different way

-- Test with direct SQL using service role
SET LOCAL ROLE service_role;

-- Try the insert that was failing
INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
VALUES ('8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 200.00, 0.00, NOW(), NOW())
ON CONFLICT (user_id, currency) DO UPDATE SET
    available = EXCLUDED.available,
    locked = EXCLUDED.locked,
    updated_at = NOW()
WHERE auth.uid() IS NOT NULL; -- Only apply if no auth context

-- Check result
SELECT * FROM wallet_balances 
WHERE user_id = '8c974284-3ca1-4184-83bc-7c17480d8e55' AND currency = 'USD';
