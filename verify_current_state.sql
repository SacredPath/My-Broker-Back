-- Verify Current Database State
-- Run this to see what's actually saved in deposit_methods table

SELECT 
    id,
    method_type,
    method_name,
    currency,
    network,
    address,
    bank_name,
    account_number,
    routing_number,
    paypal_email,
    paypal_business_name,
    instructions,
    min_amount,
    max_amount,
    fee_percentage,
    fixed_fee,
    processing_time_hours,
    is_active,
    updated_at
FROM deposit_methods 
ORDER BY method_type, currency;

-- This will show you exactly what users should see
-- Compare this with what users actually see in their dashboard
