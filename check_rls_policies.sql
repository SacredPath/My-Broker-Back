-- Check RLS policies that might affect registration
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles' OR tablename = 'auth.users';

-- Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'users') AND schemaname = 'public';
