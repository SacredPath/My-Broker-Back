-- Admin Query: View Current User Deposit Methods
-- This shows what deposit methods users currently see in their dashboard

-- 1. See the structure of deposit_methods table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deposit_methods'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. See all current deposit methods that users see
SELECT 
    id,
    method_type,
    currency,
    bank_name,
    account_number,
    routing_number,
    paypal_email,
    paypal_business_name,
    address,
    instructions,
    min_amount,
    max_amount,
    fee_percentage,
    fixed_fee,
    processing_time_hours,
    is_active,
    created_at,
    updated_at
FROM deposit_methods 
ORDER BY method_type, currency;

-- 3. Summary of active deposit methods for users
SELECT 
    method_type,
    currency,
    CASE 
        WHEN method_type = 'ach' THEN bank_name
        WHEN method_type = 'paypal' THEN paypal_email
        WHEN method_type = 'crypto' AND currency = 'BTC' THEN 'Bitcoin Wallet'
        WHEN method_type = 'crypto' AND currency = 'USDT' THEN 'USDT TRC20 Wallet'
        ELSE 'Unknown'
    END as display_name,
    is_active,
    CASE 
        WHEN is_active THEN '✅ Available to Users'
        ELSE '❌ Hidden from Users'
    END as status,
    min_amount,
    max_amount,
    fee_percentage,
    fixed_fee,
    processing_time_hours || ' hours' as processing_time
FROM deposit_methods 
ORDER BY 
    CASE WHEN is_active THEN 0 ELSE 1 END,
    method_type, 
    currency;
