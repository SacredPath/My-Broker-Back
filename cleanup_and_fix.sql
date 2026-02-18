-- Clean up stuck records and apply final fix
-- First, mark all stuck records as processed to clear them
UPDATE admin_balance_updates 
SET processed = TRUE 
WHERE processed = FALSE;

-- Now apply the clean fix function
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process wallet balance updates with immediate marking
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
    
    -- Process user balance updates with immediate marking
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
