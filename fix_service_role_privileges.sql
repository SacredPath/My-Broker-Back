-- Fix service_role privileges by granting necessary permissions

-- Grant service_role all necessary permissions
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions on balance tables
GRANT ALL ON user_balances TO service_role;
GRANT ALL ON wallet_balances TO service_role;
GRANT ALL ON admin_balance_updates TO service_role;

-- Grant execute permission on the process function
GRANT EXECUTE ON FUNCTION process_admin_balance_updates TO service_role;
GRANT EXECUTE ON FUNCTION process_admin_deposit_method_updates TO service_role;

-- Reset role to ensure proper privileges
SET ROLE service_role;
