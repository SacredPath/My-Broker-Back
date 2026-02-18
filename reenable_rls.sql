-- Re-enable RLS since policies are now correct
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'wallet_balances' AND schemaname = 'public';
