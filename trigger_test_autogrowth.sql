-- Create a test trigger function
CREATE OR REPLACE FUNCTION trigger_daily_autogrowth_test()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    users_processed INTEGER,
    total_growth DECIMAL(20,8)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_count INTEGER;
    total_growth_amount DECIMAL(20,8);
BEGIN
    -- Calculate autogrowth using test function (no notifications)
    PERFORM calculate_daily_autogrowth_test();
    
    -- Get results
    SELECT COUNT(*), COALESCE(SUM(growth_amount), 0) 
    INTO users_count, total_growth_amount
    FROM daily_autogrowth_log 
    WHERE growth_date = CURRENT_DATE AND processed = FALSE;
    
    -- Mark as processed
    UPDATE daily_autogrowth_log 
    SET processed = TRUE 
    WHERE growth_date = CURRENT_DATE;
    
    success := true;
    message := 'Daily autogrowth test processed for ' || users_count || ' users with total growth of ' || total_growth_amount;
    users_processed := users_count;
    total_growth := total_growth_amount;
    
    RETURN NEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION trigger_daily_autogrowth_test() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_daily_autogrowth_test() TO authenticated;
