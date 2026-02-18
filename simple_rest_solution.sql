-- Simple solution: Create a bypass user with service role privileges
-- This avoids RPC complexity and uses standard REST API

-- First, let's create a simple bypass approach
-- Option 1: Create a view that bypasses RLS
CREATE OR REPLACE VIEW admin_wallet_balances AS
SELECT * FROM public.wallet_balances;

-- Option 2: Create a separate table for admin operations
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

-- Grant admin access to bypass table
GRANT ALL ON admin_balance_updates TO service_role;
GRANT ALL ON admin_balance_updates TO authenticated;

-- Function to process admin updates
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process pending admin updates
    UPDATE wallet_balances wb
    SET 
        available = abu.available,
        locked = abu.locked,
        updated_at = NOW()
    FROM admin_balance_updates abu
    WHERE wb.user_id = abu.user_id 
        AND wb.currency = abu.currency
        AND abu.processed = FALSE;
    
    UPDATE user_balances ub
    SET 
        amount = abu.amount,
        usd_value = abu.usd_value,
        updated_at = NOW()
    FROM admin_balance_updates abu
    WHERE ub.user_id = abu.user_id 
        AND ub.currency = abu.currency
        AND abu.processed = FALSE;
    
    -- Mark as processed
    UPDATE admin_balance_updates 
    SET processed = TRUE 
    WHERE processed = FALSE;
END;
$$;
