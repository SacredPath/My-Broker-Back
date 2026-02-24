-- Test autogrowth function without notifications to isolate the issue
CREATE OR REPLACE FUNCTION calculate_daily_autogrowth_test()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    tier_record RECORD;
    user_balance RECORD;
    growth_amount DECIMAL(20,8);
    new_balance DECIMAL(20,8);
    locked_amount DECIMAL(20,8);
BEGIN
    -- Process each user who has balances
    FOR user_balance IN 
        SELECT DISTINCT 
            ub.user_id,
            ub.currency,
            ub.amount as balance_amount,
            COALESCE(wb.total, ub.amount) as total_balance,
            COALESCE(wb.locked, 0) as locked_amount
        FROM user_balances ub
        LEFT JOIN wallet_balances wb ON ub.user_id = wb.user_id AND ub.currency = wb.currency
        WHERE ub.amount > 0 OR wb.total > 0
        LIMIT 1  -- Only process first user for testing
    LOOP
        -- Skip if already processed today
        IF EXISTS (
            SELECT 1 FROM daily_autogrowth_log 
            WHERE user_id = user_balance.user_id 
                AND currency = user_balance.currency 
                AND growth_date = current_date
        ) THEN
            CONTINUE;
        END IF;
        
        -- Determine tier based on total balance
        SELECT it.id, it.daily_roi INTO tier_record
        FROM investment_tiers it
        WHERE user_balance.total_balance >= it.min_amount
                AND (it.max_amount IS NULL OR user_balance.total_balance <= it.max_amount)
                AND it.is_active = true
            ORDER BY it.min_amount DESC
            LIMIT 1;
        
        -- Skip if no tier found
        IF tier_record.id IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Calculate growth amount
        growth_amount := user_balance.total_balance * (tier_record.daily_roi / 100.0);
        new_balance := user_balance.total_balance + growth_amount;
        
        -- Update user balance
        UPDATE user_balances 
        SET 
            amount = new_balance,
            usd_value = new_balance,
            updated_at = NOW()
        WHERE user_id = user_balance.user_id 
            AND currency = user_balance.currency;
        
        -- Update wallet balance if exists
        UPDATE wallet_balances 
        SET 
            available = new_balance - user_balance.locked_amount,
            updated_at = NOW()
        WHERE user_id = user_balance.user_id 
            AND currency = user_balance.currency;
        
        -- Log the autogrowth
        INSERT INTO daily_autogrowth_log (
            user_id, currency, tier_id, balance_before, 
            growth_amount, growth_rate, balance_after, growth_date
        ) VALUES (
            user_balance.user_id, 
            user_balance.currency, 
            tier_record.id, 
            user_balance.total_balance, 
            growth_amount, 
            tier_record.daily_roi, 
            new_balance, 
            current_date
        );
        
        -- NO NOTIFICATION INSERT - testing without this
        
    END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_daily_autogrowth_test() TO service_role;
GRANT EXECUTE ON FUNCTION calculate_daily_autogrowth_test() TO authenticated;
