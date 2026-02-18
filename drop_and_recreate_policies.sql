-- Drop existing restrictive policies and recreate with proper service_role access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can update own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can view own wallet balances" ON wallet_balances;

-- Recreate policies with proper service_role access
CREATE POLICY "Users can insert own wallet balances" ON wallet_balances
    FOR INSERT
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet balances" ON wallet_balances
    FOR UPDATE
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet balances" ON wallet_balances
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

-- Service role policy with full access
CREATE POLICY "service_role_full_access" ON wallet_balances
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'wallet_balances' 
    AND schemaname = 'public'
ORDER BY policyname;
