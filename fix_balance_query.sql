-- Test query to get balance data from the correct tables
-- This is what the balance integration should be using

-- Get user_balances data
SELECT 
    user_id,
    amount,
    usd_value,
    currency,
    created_at,
    updated_at
FROM user_balances 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with actual user ID
ORDER BY currency;

-- Get wallet_balances data  
SELECT 
    user_id,
    available,
    locked,
    total,
    currency,
    created_at,
    updated_at
FROM wallet_balances 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with actual user ID
ORDER BY currency;

-- Combined view for a user's complete balance picture
SELECT 
    ub.user_id,
    ub.amount as user_balance_amount,
    ub.usd_value,
    ub.currency as user_balance_currency,
    wb.available as wallet_available,
    wb.locked as wallet_locked,
    wb.total as wallet_total,
    wb.currency as wallet_currency
FROM user_balances ub
FULL OUTER JOIN wallet_balances wb ON ub.user_id = wb.user_id AND ub.currency = wb.currency
WHERE ub.user_id = 'YOUR_USER_ID_HERE' OR wb.user_id = 'YOUR_USER_ID_HERE'
ORDER BY COALESCE(ub.currency, wb.currency);
