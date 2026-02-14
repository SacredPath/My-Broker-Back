-- Create RPC function for admin balance operations that bypass RLS
CREATE OR REPLACE FUNCTION admin_update_wallet_balance(
    p_user_id UUID,
    p_currency TEXT,
    p_available DECIMAL,
    p_locked DECIMAL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    currency TEXT,
    available DECIMAL,
    locked DECIMAL,
    total DECIMAL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update wallet balance with service role privileges
    INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
    VALUES (p_user_id, p_currency, p_available, p_locked, NOW(), NOW())
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        updated_at = NOW()
    RETURNING *;
END;
$$;

-- Create RPC function for user_balances as well
CREATE OR REPLACE FUNCTION admin_update_user_balance(
    p_user_id UUID,
    p_currency TEXT,
    p_amount DECIMAL,
    p_usd_value DECIMAL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    currency TEXT,
    amount DECIMAL,
    usd_value DECIMAL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update user balance with service role privileges
    INSERT INTO user_balances (user_id, currency, amount, usd_value, created_at, updated_at)
    VALUES (p_user_id, p_currency, p_amount, p_usd_value, NOW(), NOW())
    ON CONFLICT (user_id, currency) DO UPDATE SET
        amount = EXCLUDED.amount,
        usd_value = EXCLUDED.usd_value,
        updated_at = NOW()
    RETURNING *;
END;
$$;
