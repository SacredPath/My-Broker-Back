-- Fix the RLS policy conflict for wallet_balances
-- The issue: service_role bypass is blocked by user-specific policy

-- Drop the conflicting user policy that blocks service_role
DROP POLICY IF EXISTS "Users can manage own wallet balances" ON wallet_balances;

-- Create a new policy that allows both users and service_role
CREATE POLICY "Users can manage own wallet balances" ON wallet_balances
    FOR ALL
    USING (
        auth.uid() = user_id OR 
        (pg_has_role(session_user, 'service_role') AND current_setting('app.settings.jwt_role', true) = 'service_role')
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        (pg_has_role(session_user, 'service_role') AND current_setting('app.settings.jwt_role', true) = 'service_role')
    );

-- Also check and fix user_balances if it has similar issue
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_balances';

-- Drop conflicting user_balances policy if exists
DROP POLICY IF EXISTS "Users can manage own user balances" ON user_balances;

-- Create new policy that allows both users and service_role
CREATE POLICY "Users can manage own user balances" ON user_balances
    FOR ALL
    USING (
        auth.uid() = user_id OR 
        (pg_has_role(session_user, 'service_role') AND current_setting('app.settings.jwt_role', true) = 'service_role')
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        (pg_has_role(session_user, 'service_role') AND current_setting('app.settings.jwt_role', true) = 'service_role')
    );

-- Grant necessary permissions
GRANT ALL ON wallet_balances TO service_role;
GRANT ALL ON user_balances TO service_role;
