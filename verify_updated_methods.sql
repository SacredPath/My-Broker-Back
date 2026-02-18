-- Verify Updated Deposit Methods
-- This will show what users should now see

SELECT 
    method_type,
    method_name,
    currency,
    CASE 
        WHEN method_type = 'ach' THEN bank_name
        WHEN method_type = 'paypal' THEN paypal_email
        WHEN method_type = 'crypto' THEN address
    END as payment_info,
    is_active,
    updated_at
FROM deposit_methods 
WHERE is_active = true
ORDER BY method_type, currency;

-- This should show the updated values:
-- - ACH: AMERICAN BANK NA
-- - PayPal: optionshareinvestment@gmail.com  
-- - Bitcoin: HFWEUH7F4HEOIUFHH38FH49R83HEWFE3FH9
-- - USDT: 0X78DH 28FEH24HFEO3QU4WHE 9WEHF2 E
