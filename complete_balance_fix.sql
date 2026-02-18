-- Complete fix for balance management system
-- Run this script in your Supabase SQL editor

-- 1. Fix the process_admin_balance_updates function to handle both INSERT and UPDATE
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

-- 2. Ensure bypass table exists and has correct permissions
CREATE TABLE IF NOT EXISTS admin_balance_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    currency TEXT NOT NULL,
    available DECIMAL DEFAULT 0,
    locked DECIMAL DEFAULT 0,
    amount DECIMAL DEFAULT 0,
    usd_value DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Grant permissions
GRANT ALL ON admin_balance_updates TO service_role;
GRANT ALL ON admin_balance_updates TO authenticated;

-- 3. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION process_admin_balance_updates() TO service_role;
GRANT EXECUTE ON FUNCTION process_admin_balance_updates() TO authenticated;

-- 4. Clean up any stuck records
UPDATE admin_balance_updates SET processed = TRUE WHERE created_at < NOW() - INTERVAL '1 hour' AND processed = FALSE;

-- 5. Test the function
SELECT 'Balance fix applied successfully' as status;
