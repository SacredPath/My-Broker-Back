-- Debug: Check what's in the bypass table
SELECT 
    user_id,
    currency,
    available,
    locked,
    amount,
    usd_value,
    processed,
    created_at
FROM admin_balance_updates 
WHERE processed = FALSE
ORDER BY created_at DESC;

-- Also check if there are any unprocessed records from previous attempts
SELECT COUNT(*) as unprocessed_count,
       MAX(created_at) as latest_unprocessed
FROM admin_balance_updates 
WHERE processed = FALSE;
