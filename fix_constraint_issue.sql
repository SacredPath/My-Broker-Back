-- Fix constraint issue by using separate INSERT and UPDATE logic instead of ON CONFLICT
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process wallet balance updates
    -- First try to update existing records
    UPDATE wallet_balances 
    SET 
        available = abu.available,
        locked = abu.locked,
        updated_at = NOW()
    FROM admin_balance_updates abu
    WHERE wallet_balances.user_id = abu.user_id 
        AND wallet_balances.currency = abu.currency
        AND abu.processed = FALSE
        AND (abu.available != 0 OR abu.locked != 0);
    
    -- Then insert new records for those that don't exist
    INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
    SELECT 
        abu.user_id,
        abu.currency,
        abu.available,
        abu.locked,
        NOW(),
        NOW()
    FROM admin_balance_updates abu
    WHERE abu.processed = FALSE
        AND (abu.available != 0 OR abu.locked != 0)
        AND NOT EXISTS (
            SELECT 1 FROM wallet_balances wb 
            WHERE wb.user_id = abu.user_id AND wb.currency = abu.currency
        );
    
    -- Process user balance updates
    -- First try to update existing records
    UPDATE user_balances 
    SET 
        amount = abu.amount,
        usd_value = abu.usd_value,
        updated_at = NOW()
    FROM admin_balance_updates abu
    WHERE user_balances.user_id = abu.user_id 
        AND user_balances.currency = abu.currency
        AND abu.processed = FALSE
        AND (abu.amount != 0 OR abu.usd_value != 0);
    
    -- Then insert new records for those that don't exist
    INSERT INTO user_balances (user_id, currency, amount, usd_value, created_at, updated_at)
    SELECT 
        abu.user_id,
        abu.currency,
        abu.amount,
        abu.usd_value,
        NOW(),
        NOW()
    FROM admin_balance_updates abu
    WHERE abu.processed = FALSE
        AND (abu.amount != 0 OR abu.usd_value != 0)
        AND NOT EXISTS (
            SELECT 1 FROM user_balances ub 
            WHERE ub.user_id = abu.user_id AND ub.currency = abu.currency
        );
    
    -- Mark all as processed
    UPDATE admin_balance_updates 
    SET processed = TRUE 
    WHERE processed = FALSE;
END;
$$;
