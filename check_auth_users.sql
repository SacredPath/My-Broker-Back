-- Check auth.users table for existing emails
-- This might show more users than profiles table

SELECT 
    email, 
    created_at, 
    last_sign_in_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
