-- Fix the process_admin_balance_updates function to handle both INSERT and UPDATE operations
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process wallet balance updates - UPSERT (INSERT or UPDATE)
    INSERT INTO wallet_balances (user_id, currency, available, locked, total, created_at, updated_at)
    SELECT 
        abu.user_id,
        abu.currency,
        abu.available,
        abu.locked,
        abu.available + abu.locked as total,  -- Calculate total
        NOW(),
        NOW()
    FROM admin_balance_updates abu
    WHERE abu.processed = FALSE
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        total = EXCLUDED.available + EXCLUDED.locked,  -- Recalculate total
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
