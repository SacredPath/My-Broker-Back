-- Simple fix: Process each table completely separately
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- First, process all wallet balance updates
    -- Mark them as processed immediately to avoid conflicts
    WITH wallet_updates AS (
        UPDATE admin_balance_updates 
        SET processed = TRUE 
        WHERE processed = FALSE 
          AND (available != 0 OR locked != 0)
        RETURNING *
    )
    INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
    SELECT 
        wu.user_id,
        wu.currency,
        wu.available,
        wu.locked,
        NOW(),
        NOW()
    FROM wallet_updates wu
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        updated_at = NOW();
    
    -- Then, process all user balance updates
    -- Mark them as processed immediately to avoid conflicts
    WITH user_updates AS (
        UPDATE admin_balance_updates 
        SET processed = TRUE 
        WHERE processed = FALSE 
          AND (amount != 0 OR usd_value != 0)
        RETURNING *
    )
    INSERT INTO user_balances (user_id, currency, amount, usd_value, created_at, updated_at)
    SELECT 
        uu.user_id,
        uu.currency,
        uu.amount,
        uu.usd_value,
        NOW(),
        NOW()
    FROM user_updates uu
    ON CONFLICT (user_id, currency) DO UPDATE SET
        amount = EXCLUDED.amount,
        usd_value = EXCLUDED.usd_value,
        updated_at = NOW();
END;
$$;
