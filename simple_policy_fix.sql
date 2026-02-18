-- Try a simpler approach - just drop all and recreate service role policy

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can update own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can view own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "service_role_full_access" ON wallet_balances;

-- Create single service role policy
CREATE POLICY "service_role_full_access" ON wallet_balances
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify
SELECT policyname, roles, cmd FROM pg_policies 
WHERE tablename = 'wallet_balances' AND schemaname = 'public';
