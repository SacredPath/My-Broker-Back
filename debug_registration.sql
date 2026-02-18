-- Debug registration issues
-- Check if there are any constraints or issues with user creation

-- Check existing users to see if email already exists
SELECT email, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check auth.users table (if accessible)
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check for any RLS policies that might block registration
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles';
