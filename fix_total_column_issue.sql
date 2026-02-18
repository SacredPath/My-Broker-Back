-- Fix the total column issue - it's a generated column, don't insert into it
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process wallet balance updates - UPSERT (INSERT or UPDATE)
    -- Note: total is a generated column, so we don't insert/update it
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
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        updated_at = NOW();
    
    -- Process user balance updates - UPSERT (INSERT or UPDATE)
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
    ON CONFLICT (user_id, currency) DO UPDATE SET
        amount = EXCLUDED.amount,
        usd_value = EXCLUDED.usd_value,
        updated_at = NOW();
    
    -- Mark as processed
    UPDATE admin_balance_updates 
    SET processed = TRUE 
    WHERE processed = FALSE;
END;
$$;
