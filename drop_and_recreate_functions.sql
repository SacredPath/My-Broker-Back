-- Drop existing RPC functions completely
DROP FUNCTION IF EXISTS admin_update_wallet_balance(UUID, TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS admin_update_user_balance(UUID, TEXT, DECIMAL, DECIMAL);

-- Recreate with completely unambiguous column references
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
    -- Insert or update with explicit table references
    INSERT INTO public.wallet_balances (user_id, currency, available, locked, created_at, updated_at)
    VALUES (p_user_id, p_currency, p_available, p_locked, NOW(), NOW())
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        updated_at = NOW()
    RETURNING 
        wb.id, wb.user_id, wb.currency, 
        wb.available, wb.locked, wb.total,
        wb.created_at, wb.updated_at;
END;
$$;

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
    -- Insert or update with explicit table references
    INSERT INTO public.user_balances (user_id, currency, amount, usd_value, created_at, updated_at)
    VALUES (p_user_id, p_currency, p_amount, p_usd_value, NOW(), NOW())
    ON CONFLICT (user_id, currency) DO UPDATE SET
        amount = EXCLUDED.amount,
        usd_value = EXCLUDED.usd_value,
        updated_at = NOW()
    RETURNING 
        ub.id, ub.user_id, ub.currency,
        ub.amount, ub.usd_value,
        ub.created_at, ub.updated_at;
END;
$$;
