-- Final fix: Create service role policy that takes precedence
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can insert own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can update own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can view own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "service_role_full_access" ON wallet_balances;

-- Create service role policy first (higher precedence)
CREATE POLICY "service_role_full_access" ON wallet_balances
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create user policies after service role (lower precedence)
CREATE POLICY "Users can manage own wallet balances" ON wallet_balances
    FOR ALL
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Verify policies
SELECT policyname, roles, cmd FROM pg_policies 
WHERE tablename = 'wallet_balances' AND schemaname = 'public'
ORDER BY policyname;
